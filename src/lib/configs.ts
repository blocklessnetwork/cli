import yaml from "js-yaml";
import fs from "fs";
import { store } from "../store";

export const coordinatorConfig = `
node:
  name: coordinator#1
  ip: 0.0.0.0
  port: 9527
  rendezvous: txmesh/node
  boot_nodes:
  use_static_keys: true
  conf_path: .
protocol:
  role: coordinator
  seed: 0
  protocol_id: /p2p/rpc/coordinator
  peer_protocol_id: /p2p/rpc/worker
logging:
  file_path: stdout
  level: info
rest:
  addr: :8080
ui:
  coordinator_addr: :8081
repository:
  url: https://wasi.bls.dev/api/sync
stake:
  disabled: true
`;

export const coordinatorConfigJSON = yaml.load(coordinatorConfig);

export const workerConfig = `
node:
  name: worker\${id}
  ip: 0.0.0.0
  port: 0
  rendezvous: txmesh/node
  boot_nodes:
  coordinator_address: 127.0.0.1
  coordinator_port: 9527
  coordinator_id: co_id
  workspace_root: /tmp/txmesh/functions
  conf_path: .
protocol:
  role: worker
  seed: 0
  protocol_id: /p2p/rpc/worker
  peer_protocol_id: /p2p/rpc/coordinator
logging:
  file_path: stdout
  level: info
repository:
  url: https://wasi.bls.dev/api/sync
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
