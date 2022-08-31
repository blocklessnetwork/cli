# Blockless CLI
The Blockless CLI helps you build, test, and manage your deployments and projects right from the terminal.

**With the Blockless CLI, you can:**

- Build and deploy your functions to the Blockless network
- Test locally with a fully emulated production environment
- Create, list, or delete functions.
- Manage wallet and permissions.

## Installation

Blockless CLI is available for macOS, Windows, and Linux. Windows with arm64 architecture will be supported shortly. Installation can be done via bash for all supported platforms.

Supported Platforms

| OS      | arm64 | x64 |
| ------- | ----- | --- |
| Windows |       | x   |
| Linux   | x     | x   |
| MacOS   | x     | x   |

Using curl:

```bash
sudo sh -c "curl https://raw.githubusercontent.com/txlabs/blockless-cli/main/download.sh | bash"
```

Using wget:

```bash
sudo sh -c "wget https://raw.githubusercontent.com/txlabs/blockless-cli/main/download.sh -v -O download.sh; chmod +x download.sh; ./download.sh; rm -rf download.sh"
```

## Usage

Installing the Blockless CLI provides access to the `bls` command.

```sh-session
bls [command]
# Run `--help` for detailed information about CLI commands
bls [command] help
```

## Commands

The Stripe CLI supports a broad range of commands. Below is some of the most used ones:
- `bls help`
- `bls console`
- `bls login`
- `bls whoami`
- `bls components`
- `bls function`

## Documentation

For a full reference, see the [Blockless CLI reference](https://docs.blockless.network/docs/cli)

## Contributing

This client command utility is written in `typescript` , and packaged using `nexe`.

- Node 14.17
- Typescript
- Pkg Wrapper

Use `dev-bin.js` to test locally, use `npm link` if you wish to test bin globally installed.
