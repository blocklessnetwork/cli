import yaml from "js-yaml";
import fs from "fs";
import { store } from "../store";

export const headConfig = `
node:
  name: head#1
  ip: 0.0.0.0
  port: 9527
  key_path: KEY_PATH
  use_static_keys: true
  workspace_root: /tmp/head
  runtime_path: /tmp/runtime
rest:
  ip: 0.0.0.0
  port: 8081
protocol:
  role: head
logging:
  file_path: stdout
  level: info
repository:
  url: https://wasi.bls.dev/api/sync
chain:
  address_key: "alice"
  rpc: "https://edgenet.bls.dev:26657"
`;

export const headConfigJSON = yaml.load(headConfig);

export const workerConfig = `
node:
  name: worker#1
  ip: 0.0.0.0
  port: 0
  boot_nodes:
    - /ip4/159.89.90.90/tcp/30330/p2p/12D3KooWKTKwW1y6iRoGeag1y2wpNYV9UM8QaYXaTL7DUTZdEFw6
  workspace_root: /tmp/worker
  runtime_path: /tmp/runtime
rest:
  ip: 0.0.0.0
  port: 8081
protocol:
  role: worker
logging:
  file_path: stdout
  level: info
repository:
  url: https://wasi.bls.dev/api/sync
chain:
  address_key: "alice"
  rpc: "https://edgenet.bls.dev:26657"
`;

export const workerConfigJSON = yaml.load(workerConfig);

export const saveConfig = (config: any, name: string) => {
  const configYaml = yaml.dump(config);
  fs.writeFileSync(
    `${store.system.homedir}/.bls/network/${name}.yaml`,
    configYaml,
    {
      flag: "w",
    }
  );
};
