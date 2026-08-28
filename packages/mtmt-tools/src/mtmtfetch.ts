export const baseURL = "https://m2.mtmt.hu";

export const getMTMTObject = async (object: string, params?: string): Promise<{ [key: string]: unknown }> => {
    const response = await fetch(`${baseURL}${object}?${params ?? ""}&format=json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};
