// src/storage/SecureStorage.js

import * as Keychain from 'react-native-keychain';

/**
 * 安全存储 (使用生物识别加密)
 */
class SecureStorage {
  /**
   * 存储敏感数据
   */
  async set(key, value, options = {}) {
    try {
      await Keychain.setGenericPassword(key, value, {
        accessControl: options.biometric
          ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY
          : Keychain.ACCESS_CONTROL.USER_PRESENCE,
        accessible: options.biometric
          ? Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY
          : Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      });
      console.log(`SecureStorage: Saved ${key}`);
      return true;
    } catch (error) {
      console.error('SecureStorage: set failed:', error);
      return false;
    }
  }

  /**
   * 读取敏感数据
   */
  async get(key) {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.username === key) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('SecureStorage: get failed:', error);
      return null;
    }
  }

  /**
   * 删除敏感数据
   */
  async delete(key) {
    try {
      await Keychain.resetGenericPassword();
      console.log(`SecureStorage: Deleted ${key}`);
      return true;
    } catch (error) {
      console.error('SecureStorage: delete failed:', error);
      return false;
    }
  }

  /**
   * 检查是否支持生物识别
   */
  async canUseBiometric() {
    try {
      const can = await Keychain.canImplyAuthentication();
      return can;
    } catch (error) {
      return false;
    }
  }
}

export default new SecureStorage();
