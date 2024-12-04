export class CleverTapLog {
    static log(str: string) {
      console.log(`\tclevertap-expo-plugin: ${str}`)
    }
  
    static error(str: string) {
      console.error(`\tclevertap-expo-plugin: ${str}`)
    }
  }