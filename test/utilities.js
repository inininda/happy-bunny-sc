const { expect } = require("chai");

const daSignatures = [
  "0xad26513e9332ef03156cd8317fba47a88798f270de80c04b6bf2593a2c43c9cf67f2c11a1a57f5facfc9534c796b0a559bc42580683e14d558ba5afe8e1f94251c",
  "0x512b5d54307b03c3ca7a8b82f9434992259c53e5e6de5fd9f2f338b1f182dc595148ae1edbf902c244a81697f71a9aadb1165a7c0cd950598ee0d829ec7408671c",
  "0xe99c782f4cf4b11f611124bd8399e8fb39eca9c90a675c0bde393e5d3403066f2f39c74faced10569e22903bd66c12f88864fb8d72e57b864de757cab10cdea51b",
  "0x73dcd4809e39709dc7b12c7d73d36bec8f508eb9870f7fd1d95a528e2a0ba32653db9988dd08758c0cc352e7eaedcc5bad926d27f447f935bd334eba2cc8dbe81b",
  "0x6f6cb9a80bba929f88b83837c33f2fec2f48e0889ec260a5f1bed7f9c303894a47fe1647b16364ffda59954dad786571529abcc61d7644f3edd4eb1c70ee6e751b",
  "0x4b7ab36ba831630c207363e5b653c76c5c310baf360d6f7ebabb3b0f01f1da543ce79b0396046cf7dd00428f35f65d0ce2c2e7764f08cca683a18f86de22398e1c",
  "0x9064cc48c083a12bdff0f9c42ea9e5ae14e3863a43f6c83189fa5e5af9cd1c777a7565f1d58903642360e2cce88f7e1d56f2746a49398b785373ee77a2622b341b",
  "0x1a91e4114d2204af8692e6b0072bff5867ebf17b8a6cb799f663a8d210dee4e07b5e843c71cedf104ad391e986b8a3ad3c857d4126676c9b14d418cafc263edc1c",
  "0x0d63f230eb2262c76a60769b529ec135f7d38f5146ed0eb523a2fcae8dcfca3d2536c2997529bc3a73a5a0694b6a696238438f5e981772a20f32d6153cc3d5d31b",
  "0x2d37b4a574cc27166add1826dc05bdf9e838374c0d10924c97ae5d775ff3975e69414e49538307379d51ff9da3b336813e0e2a44838e89ae13bba767018c4c251c",
  "0x3f49d051413e0fdd763ecfa9605db7ee57c0c88891a01597b6d3a4ac5086bf8b2c771d85898ac44b941f39dc886d417f6c9686e28771f393e5c79b1bb4252c421c",
  "0x0981b68b2f7a2fb11ed3c9a7f9945328065eed36a6206c1f55ab8cd55981c13b37daac75a57cffc284d0ecea97161f1363a7c0969b6983ac759e4ffb7bb86ca91b",
  "0x7ecf9e6533ececce567dad2a10ecbfbe67845085fa3a888de962583f7e8ef8005a154dfd55da4dabad1cf61a5bc4a240c60ebc65c8499e1422b39f6824ad991b1b",
  "0x6f0502aa2553e1afd0048036f5c42ff615ecbf2f37d061ed62367c829d964a357d4a069f5f4804808bff38039f1e4b482f0e623088cd9ef25ddea5dc308539101b",
  "0x24d5f221d4a30b55ebd9885dbe6e6f21b49a172bd929c32ae5ef05f7cf1d56c9304ebf388702ea406bd04bd3a5adae4bbd3c42b5ff2210e591fd5a00c2715b971b",
  "0x2cb1a2f4dfa5619b03488610ecabd2468f3dbe12965a1cfb3e9e86b935ca1ca03832c59d8070a114b4515183adfab2696cf247e074246c5d0a4339b1f0cc05c51c",
  "0x66795690d76b581ed7f56acf65bf40bdc751b2953fb962a8c0aeca11ee0fdcf139924b372027ec32ce72906977db95674759c62c8189a6131dc8383ccddc87221b",
  "0x2bc2471dc8c412ff674696a3864c18af8e0a4db496b0fcd215dc77f33c9e57ee61ac6f71bb9b4de2e77131dac53f0a07986566242e8e94aac05887f79ee31f7a1c",
  "0x37439b3e0daa198b1c158d7de7c739b2774957f964ac25b80393659a9c5e8df2190fa443c8d396373f3671d0f5a5ce7c8953c3572c94f024612b59da4b67dcc41b",
  "0x3cc910b735052b24ce623612b1dc96d32f1a0c3aacbae90fe6303a7a904fd1f5663063919b41eb87257ca1e812f060426d95f6ee288c5e82ef87ba942f6c817c1b",
];

const generateRandomHex = (size) =>
  [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

const verifyRemainingSupply = async (hbContract, mintQty) =>{
  // test remaining supply
  const totalSupply = await hbContract.totalSupply()
  console.log("Total Minted: ", totalSupply.toNumber());

  expect(totalSupply.toNumber()).to.equal(mintQty);

  const remainingSupply = parseInt((await hbContract.getRemainingSupply()).toString())
  console.log("Remaining Supply: ", remainingSupply);

  expect(remainingSupply).to.equal(
    (await hbContract.MAX_SUPPLY()) - totalSupply
  );

};

const completeAuctionMint = async (hbContract,contractOwner) => {
  await hbContract.auctionMint();
  const balance = await hbContract.balanceOf(contractOwner);
  expect(parseInt(balance.toString())).to.equal(1);
};

const completePreSaleBuy = async (
  hbContract,
  account,
  merkleProof,
  allowedMintQuantity,
  mintQuantity
) => {
  const price = await hbContract.mintPrice();

  await hbContract.connect(account).preSaleBuy(merkleProof, allowedMintQuantity, mintQuantity, {
    value: String(price * mintQuantity),
  });
};

const completePublicSaleBuy = async (
  hbContract,
  accounts,
  numOfaccounts,
  runTest = false
) => {
  const price = await hbContract.mintPrice();

  for (let i = 0; i < numOfaccounts; i++) {
    await hbContract.connect(accounts[i]).publicSaleBuy(daSignatures[i], {
      value: String(price),
    });

    if (runTest) {
      const balance = await hbContract.balanceOf(accounts[i].address);
      expect(parseInt(balance)).to.equal(1);
    }
  }
};

/*
  Pre-defined WL addresses used for tests
  Merkle Root:
    0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974
*/
const getTestWLData = (address) => {
  const wlAddresses = [
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      allowedQuantity: 15,
      merkleProof: [
        "0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c",
        "0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57",
      ],
    },
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      allowedQuantity: 1,
      merkleProof: [
        "0xca0c263ef03fe9a684ef0aa61b1e13332d2e9aa088769eb794d5b463a634bebe",
        "0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57",
      ],
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      allowedQuantity: 2,
      merkleProof: [
        "0x8d1187a2c5d69d9d0f6e6c8baf49c9549b9573585daef9b8634509e0cb8d99ae",
        "0x03b1d6e746d6f0c003c976be01df72a711c9a8494865ad74e561e551c21b22a1",
      ],
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      allowedQuantity: 3,
      merkleProof: [
        "0xd0583fe73ce94e513e73539afcb4db4c1ed1834a418c3f0ef2d5cff7c8bb1dee",
        "0x03b1d6e746d6f0c003c976be01df72a711c9a8494865ad74e561e551c21b22a1",
      ],
    },
  ];

  return wlAddresses.find((wlAddress) => wlAddress.address === address);
};

/*
  Signature for this.accounts
*/
const getTestDAData = (index) => {
  return daSignatures[index];
};
module.exports = {
  generateRandomHex,
  completeAuctionMint,
  completePreSaleBuy,
  completePublicSaleBuy,
  getTestWLData,
  getTestDAData,
  verifyRemainingSupply,
  daSignatures
};
