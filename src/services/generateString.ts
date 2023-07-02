// create a random url
const generateString = () => {
    let n = new Date().getTime();
    // Map to store 62 possible characters
    let map = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
    let stringGenerate = [];
  
    // Convert given integer id to a base 62 number
    while (n) 
    {
        // use above map to store actual character
        // in short url
        stringGenerate.push(map[n % 62]);
        n = Math.floor(n / 62);
    }
  
    // Reverse shortURL to complete base conversion
    stringGenerate.reverse();
  
    return stringGenerate.join("");
}

export default generateString