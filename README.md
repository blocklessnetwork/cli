# `bls` the blockless cli

Command your blockless deployments and projects, and participate in our on-chain network.

If you intend to run a blockchain Validator, Node, IBC Relayer, or would rather interact with only the on-chain network see [`blsd` blockless chain](https://github.com/txlabs/blockless-chain/)

## installing

Install the latest version of the prebuilt CLI by running the following command on bash.

Supported Platforms

| OS      | arm64 | x64 |
| ------- | ----- | --- |
| Windows | x     | x   |
| Linux   | x     | x   |
| MacOS   | x     | x   |

curl

```bash
sudo sh -c "curl https://raw.githubusercontent.com/txlabs/blockless-cli/main/download.sh | bash"
```

wget

```bash
sudo sh -c "wget https://raw.githubusercontent.com/txlabs/blockless-cli/main/download.sh -v -O download.sh; chmod +x download.sh; ./download.sh; rm -rf download.sh"
```

In a different environment? Use `npm` with `node 14`.

```bash
npm i -g @blockless/cli
```

## contributing

this client command utility is written in `typescript` , and packaged using `nexe`.

- Node 14.15
- Typescript
- Pkg Wrapper

use `dev-bin.js` to test locally, use `npm link` if you wish to test bin globally installed.
