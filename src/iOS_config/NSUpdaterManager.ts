import { FileManager } from './FileManager';
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
  GROUP_IDENTIFIER_TEMPLATE_REGEX
} from './IOSConstants';

export default class NSUpdaterManager {
  private extensionPath = '';
  private plistFileName = '';
  private entitlementsFileName?: string;
  constructor(extensionPath: string, plistFileName: string, entitlementsFileName?: string) {
    this.extensionPath = extensionPath;
    this.plistFileName = plistFileName;
    this.entitlementsFileName = entitlementsFileName;
  }

  async updateNSEEntitlements(groupIdentifier: string): Promise<void> {
    const entitlementsFilePath = `${this.extensionPath}/${this.entitlementsFileName}`;
    let entitlementsFile = await FileManager.readFile(entitlementsFilePath);

    entitlementsFile = entitlementsFile.replace(GROUP_IDENTIFIER_TEMPLATE_REGEX, groupIdentifier);
    await FileManager.writeFile(entitlementsFilePath, entitlementsFile);
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