# Blockless CLI
The BLS CLI is a powerful tool for interacting with the Blockless network directly from the command line. With it, you can easily connect to the network, manage your identities, and build, test, and manage your deployments and projects.

## Installation
Blockless CLI is available for macOS, Windows, and Linux. Windows with arm64 architecture will be supported shortly. Installation can be done via bash for all supported platforms.

Supported Platforms

| OS      | arm64 | x64 |
| ------- | ----- | --- |
| Windows |       | x   |
| Linux   | x     | x   |
| MacOS   | x     | x   |

Using **curl**:

```bash
sudo sh -c "curl https://raw.githubusercontent.com/BlocklessNetwork/cli/main/download.sh | bash"
```

Using **wget**:

```bash
sudo sh -c "wget https://raw.githubusercontent.com/BlocklessNetwork/cli/main/download.sh -v -O download.sh; chmod +x download.sh; ./download.sh; rm -rf download.sh"
```

## Usage

To use the BLS CLI, open a terminal and run the `bls` command followed by the subcommand you want to use. For example, to connect to the Blockless network, you can run the `login` subcommand:

```sh
bls login
```

To see a list of available subcommands, run the `bls` command with the `--help` or `-h` flag:

```sh
bls --help
```

## Commonly Used Commands

The BLS CLI provides a range of commands for interacting with the Blockless network. Some of the most commonly used commands are:

- `bls help`: Displays information and usage instructions for the BLS CLI and its available subcommands.
- `bls console`: Opens the BLS console, a web-based interface for managing your deployments and projects on the Blockless network.
- `bls login`: Authenticates and logs in to the Blockless network using your wallet keypair.
- `bls whoami`: Shows information about your current identity on the Blockless network, including your public key.
- `bls components`: Manages your local environment components, including the local worker agent and orchestrator agent.
- `bls function`: Build, test, and manage your projects and functions.

For a complete list of available commands and their usage, you can run the `bls -h` command or visit the [Blockless CLI reference](https://blockless.network/docs/cli) for detailed documentation.

## Documentation

For a full reference, see the [Blockless CLI reference](https://blockless.network/docs/cli)

## Contributing

This client command utility is written in `typescript` , and packaged using vercel's `pkg` for now.

- Node 14.17
- Typescript
- Pkg Wrapper

Use `dev-bin.js` to test locally, use `npm link` if you wish to test bin globally installed.
