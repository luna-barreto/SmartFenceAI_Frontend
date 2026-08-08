import { NavigatorScreenParams } from "@react-navigation/native";

export type PilaAutenticacion = {
  Login: undefined;
};

export type PilaRaiz = {
  Splash: undefined;
  Auth: NavigatorScreenParams<PilaAutenticacion> | undefined;
  Main: undefined;
  Home: undefined;
  Map: undefined;
  Animals: undefined;
  Alerts: undefined;
  Profile: undefined;
  AnimalDetail: { animalId: string };
  Devices: undefined;
  Settings: undefined;
  Info: undefined;
  Admin: undefined;
  SaludIA: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends PilaRaiz {}
  }
}
