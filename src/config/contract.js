export const CONTRACT_ADDRESS = "0x25Ca595d3eD41C6b766243Db2247df76EE8D220A";

// USDC on Arc Testnet - verify at docs.arc.network/arc/references/contract-addresses
export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export const CONTRACT_ABI = [
  "function saveContact(string calldata xHandle, string calldata xURL, address wallet) external",
  "function getMyContacts() external view returns (tuple(address wallet, string xHandle, string xURL, bool exists)[])",
  "function deleteContact(string calldata xHandle) external",
  "function sendToContact(string calldata xHandle, address tokenAddress, uint256 amount) external",
  "function sendToAddress(address recipient, address tokenAddress, uint256 amount) external",
  "event ContactSaved(address indexed sender, string xHandle, address wallet)",
  "event ContactDeleted(address indexed sender, string xHandle)",
  "event TokenSent(address indexed sender, address indexed recipient, address token, uint256 amount, string xHandle)"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];
