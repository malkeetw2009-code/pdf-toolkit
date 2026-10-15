export class EngineManager {
  constructor() {
    this.engines = new Map();
  }

  async registerEngine(engineName, engineModule) {
    if (!engineModule.name || typeof engineModule.process !== 'function') {
      throw new Error(`अमान्य इंजन प्रारूप: ${engineName}`);
    }
    
    // Compatibility & Initialization check
    if (typeof engineModule.initialize === 'function') {
      await engineModule.initialize();
    }

    this.engines.set(engineName, engineModule);
    console.log(`Engine Registered Successfully: ${engineModule.name} (${engineModule.version})`);
  }

  getEngineForTool(toolId) {
    for (const [name, engine] of this.engines.entries()) {
      if (engine.tools && engine.tools.includes(toolId)) {
        return engine;
      }
    }
    return null;
  }

  async executeTool(toolId, files, options = {}, onProgress) {
    const engine = this.getEngineForTool(toolId);
    if (!engine) {
      throw new Error(`टूल '${toolId}' के लिए कोई सक्रिय प्रोसेसिंग इंजन उपलब्ध नहीं है।`);
    }
    return await engine.process({ toolId, files, options, onProgress });
  }
}
