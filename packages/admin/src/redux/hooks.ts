import {
  shallowEqual,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppShallowEqualSelector: TypedUseSelectorHook<RootState> = (
  selector,
) => {
  return useAppSelector(selector, shallowEqual);
};

export const useI18n = () => {
  return useAppShallowEqualSelector((state) => state.i18n);
};
export const useUser = () => {
  return useAppShallowEqualSelector((state) => state.user);
};
