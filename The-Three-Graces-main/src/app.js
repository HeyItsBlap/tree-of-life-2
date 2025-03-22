import ollama from "ollama";

const category = "Eukaryota";
const selectedModel = "gemma3:12b"; // Define or import accordingly

try {
  const output = await ollama.generate({
    model: selectedModel,
    prompt: `Please generate a brief description of ${category} in the context of a taxonomy tree, including what the category is, notable examples, characteristics, etc.`,
  });
  
  console.log(output.response); // Adjust based on actual API response shape
} catch (error) {
  console.error("Error generating description:", error);
}