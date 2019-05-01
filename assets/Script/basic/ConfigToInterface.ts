const input = {

}




function json2Types(input: any): string {
    let json = input;
    let result = "{"
    let type = "";
    for (let key in json) {
        if (typeof json[key] == "string") {
            type = "string";
        } else if (typeof json[key] == "number") {
            type = "number";
        } else if (json[key] instanceof Array) {
            if (json[key].length == 0) {
                type = "Array<any>";
            } else {
                type = "Array<" +  json2Types(json[key][0]) + ">";
            }
        } else if (json[key] instanceof Object) { 
            type = json2Types(json[key])
        }

        result += key + ": " + type + ",\n";
    }
    return result + "}";
}

console.log(json2Types(input))