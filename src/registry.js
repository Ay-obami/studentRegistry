import { ethers } from "ethers";


const CONTRACT_ADDRESS = "0xa551cb621e1b7b2350049d842bf73C1c4e89a126";

const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";


const CHUNK_SIZE = 100;


const REGISTRY_ABI = [
  "function register(string _name, uint256 _age, string _course)",
  "function getStudent(address _student) view returns (string name, uint256 age, string course)",
  "function registered(address) view returns (bool)",
];

const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
];

const registryInterface = new ethers.Interface(REGISTRY_ABI);


export async function register(signer, name, age, course) {
  const registry = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);
  const tx = await registry.register(name, BigInt(age), course);
  const receipt = await tx.wait();
  return receipt;
}


export async function getStudent(signer, address) {
  const registry = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);
  try {
    const [name, age, course] = await registry.getStudent(address);
    return { address, name, age: Number(age), course };
  } catch {
    return null;
  }
}


export async function getStudents(signer, addresses) {
  const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, signer);
  const valid = addresses.filter((a) => ethers.isAddress(a));
  const students = [];

  for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
    const chunk = valid.slice(i, i + CHUNK_SIZE);

    const calls = chunk.map((addr) => ({
      target: CONTRACT_ADDRESS,
      allowFailure: true,
      callData: registryInterface.encodeFunctionData("getStudent", [addr]),
    }));

    const results = await multicall.aggregate3.staticCall(calls);

    results.forEach((result, idx) => {
      if (!result.success) return;
      const [name, age, course] = registryInterface.decodeFunctionResult(
        "getStudent",
        result.returnData
      );
      students.push({ address: chunk[idx], name, age: Number(age), course });
    });
  }

  return students;
}