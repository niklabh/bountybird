import {
  LensConfig,
  development,
  production,
  EnvironmentConfig,
} from "@lens-protocol/react-web";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";

const lensEnvironment: EnvironmentConfig =
  process.env.NODE_ENV === "production" ? production : development;

const lensConfig: LensConfig = {
  bindings: wagmiBindings(),
  environment: lensEnvironment,
};

export * from "@lens-protocol/react-web";
export { lensConfig };
