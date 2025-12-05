import React from "react";

import type {
  DisableFullWindowOverlayFunction,
  EnableFullWindowOverlayFunction,
  GlobalHideAllFunction,
  GlobalHideFunction,
  GlobalShowFunction,
} from "../constants/types";
import {
  // HideReturn is used in JS Doc
  // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  HideReturn,
} from "../constants/types";

// 改为ref数组，支持多个MagicModalPortal实例
export const magicModalRefs: React.RefObject<IModal>[] = [];

// 生成唯一ID
export const generatePortalId = (): string => {
  return `portal_${Math.random().toString(36).substring(7).toUpperCase()}_${Date.now()}`;
};

// 注册portal
export const registerPortal = (ref: React.RefObject<IModal>): string => {
  console.log(ref)
  magicModalRefs.push(ref);
  return generatePortalId();
};

// 注销portal
export const unregisterPortal = (ref: React.RefObject<IModal>): void => {
  const index = magicModalRefs.indexOf(ref);
  if (index !== -1) {
    magicModalRefs.splice(index, 1);
  }
};

// 获取可用的magic modal实例，优先使用最后注册的可用实例
const getMagicModal = (): NonNullable<IModal> => {
  console.log(magicModalRefs)
  // 从后往前查找第一个有current值的ref
  for (let i = magicModalRefs.length - 1; i >= 0; i--) {
    if (magicModalRefs[i]?.current) {
      return magicModalRefs[i]?.current as NonNullable<IModal>;
    }
  }
  
  throw new Error(
    "MagicModalPortal not found. Please wrap your component with MagicModalPortal.",
  );
};

const show: GlobalShowFunction = (newComponent, newConfig) => {
  return getMagicModal().show(newComponent, newConfig);
};

const hide: GlobalHideFunction = (props, { modalID } = {}) => {
  getMagicModal().hide(props, { modalID });
};

const enableFullWindowOverlay: EnableFullWindowOverlayFunction = () => {
  getMagicModal().enableFullWindowOverlay();
};

const disableFullWindowOverlay: DisableFullWindowOverlayFunction = () => {
  getMagicModal().disableFullWindowOverlay();
};

const hideAll: GlobalHideAllFunction = () => {
  // We recommend using this method in jest, and having throw because the ref was not found isn't useful there.
  // Not all tests are necessarily using the provider.
  try {
    return getMagicModal().hideAll();
  } catch (error) {
    // 静默失败，兼容测试环境
    console.log("No MagicModalPortal found, but continuing anyway (for tests)");
    return undefined;
  }
};
export interface IModal {
  show: typeof show;
  hide: typeof hide;
  hideAll: typeof hideAll;
  enableFullWindowOverlay: typeof enableFullWindowOverlay;
  disableFullWindowOverlay: typeof disableFullWindowOverlay;
}

/**
 * @example
 * ```js
 * // ...
 * import { magicModal } from 'react-native-magic-toast';
 *
 * // ...
 * const ExampleModal = () => (
 *  const { hide } = useMagicModal<{ message: string }>();
 *  <Pressable onPress={() => hide({ message: "hey" })}>
 *    <Text>Test!</Text>
 *  </Pressable>
 * )
 *
 * const result = magicModal.show(ExampleModal);
 * console.log(await result.promise); // Returns { reason: MagicModalHideReason.INTENTIONAL_HIDE, message: "hey" } when the modal is closed by the Pressable.
 * ```
 */
export const magicModal = {
  /**
   * @description Pushes a modal to the Stack, it will be displayed on top of the others.
   * @param newComponent Recieves a function that returns a modal component.
   * @param newConfig Recieves {@link NewConfigProps}  to override the default configs.
   * @returns Returns a Promise that resolves with the {@link hide} props when the Modal is closed. If it were closed automatically, without the manual use of {@link hide}, the return would be one of {@link HideReturn}
   */
  show,
  /**
   * @description Hides the given modal. Prefer using `hide` from `useMagicModal`, as it already infers the modalID.
   * You should use the `magicModal.hide` function directly  only when calling from outside the modal.
   * @param props Those props will be passed to the {@link show} resolve function.
   */
  hide,
  /**
   * @description Hides all modals in the stack. This function should be used sparingly, as it's generally preferable to hide modals individually from within the modal itself.
   * However, this function can be useful in edge cases. It's also useful for test suites, such as calling hideAll in Jest's beforeEach function as a cleanup step.
   */
  hideAll,
  /**
   * @description Enables the full window overlay globally. This is useful for modals that need to be displayed on top of native iOS modal screens. The function is no-op on non-iOS platforms.
   * @example
   * ```js
   * magicModal.disableFullWindowOverlay();
   * await magicModal.show(() => <ExampleModal />).promise;
   * magicModal.enableFullWindowOverlay();
   * ```
   * @platform ios
   */
  enableFullWindowOverlay,
  /**
   * @description Disables the full window overlay globally. This is useful for modals that do not need to be displayed on top of native iOS modal screens. The function is no-op on non-iOS platforms.
   * @example
   * ```js
   * magicModal.disableFullWindowOverlay();
   * await magicModal.show(() => <ExampleModal />).promise;
   * magicModal.enableFullWindowOverlay();
   * ```
   * @platform ios
   */
  disableFullWindowOverlay,
};
