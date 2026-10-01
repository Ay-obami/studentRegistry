import { ethers } from "ethers";

const REGISTRY_ADDRESS = "0xa551cb621e1b7b2350049d842bf73C1c4e89a126";
const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const BATCH_SIZE = 100;

const REGISTRY_ABI = [
  "function register(string name, uint256 age, string course)",
  "function getStudent(address student) view returns (string name, uint256 age, string course)",
];

const MULTICALL_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] results)",
];

const registryInterface = new ethers.Interface(REGISTRY_ABI);

export async function registerStudent(signer, student) {
  const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
  const transaction = await contract.register(
    student.name,
    BigInt(student.age),
    student.course,
  );

  return transaction.wait();
}

export async function getStudent(signer, address) {
  const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);

  try {
    const [name, age, course] = await contract.getStudent(address);
    return { address, name, age: Number(age), course };
  } catch (error) {
    if (error.code === "CALL_EXCEPTION") return null;
    throw error;
  }
}

export function decodeStudentResults(addresses, results) {
  const students = [];

  results.forEach((result, index) => {
    if (!result.success) return;

    const [name, age, course] = registryInterface.decodeFunctionResult(
      "getStudent",
      result.returnData,
    );

    students.push({
      address: addresses[index],
      name,
      age: Number(age),
      course,
    });
  });

  return students;
}

function createStudentCalls(addresses) {
  return addresses.map((address) => ({
    target: REGISTRY_ADDRESS,
    allowFailure: true,
    callData: registryInterface.encodeFunctionData("getStudent", [address]),
  }));
}

export async function getStudents(signer, addresses) {
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI,
    signer,
  );
  const students = [];

  for (let start = 0; start < addresses.length; start += BATCH_SIZE) {
    const batchAddresses = addresses.slice(start, start + BATCH_SIZE);
    const calls = createStudentCalls(batchAddresses);
    const results = await multicall.aggregate3.staticCall(calls);

    students.push(...decodeStudentResults(batchAddresses, results));
  }

  return students;
}
