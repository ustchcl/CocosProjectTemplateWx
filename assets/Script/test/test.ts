export class TestSingleInstance {
    private static _instance: TestSingleInstance = null;
    private constructor() {
        
    }

    public static getInstance(): TestSingleInstance {
        if (this._instance == null) {
            this._instance = new TestSingleInstance();
        }
        return this._instance;
    }
}
