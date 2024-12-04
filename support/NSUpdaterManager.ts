import { FileManager } from './FileManager';
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
} from './IOSConstants';

export default class NSUpdaterManager {
  private extensionPath = '';
  private plistFileName = '';
  constructor(extensionPath: string, plistFileName: string) {
    this.extensionPath = extensionPath;
    this.plistFileName = plistFileName;
  }

  async updateNEBundleVersion(version: string): Promise<void> {
    const plistFilePath = `${this.extensionPath}/${this.plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }

  async updateNEBundleShortVersion(version: string): Promise<void> {
    const plistFilePath = `${this.extensionPath}/${this.plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }
}