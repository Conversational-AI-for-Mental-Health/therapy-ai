
export async function callBackendAPI(prompt: string, systemInstruction: string): Promise<string> {
    try {
        const response = await fetch('http://localhost:3000/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: prompt,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            return "I'm having a little trouble thinking right now. Please try again in a moment.";
        }

        const data = await response.json();
        return data.aiResponse || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
        console.error('Error calling backend API:', error);
        return 'Sorry, there was an error connecting to the server. Please try again.';
    }
}
