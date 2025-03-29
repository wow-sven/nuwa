import { useQuery } from "@tanstack/react-query";
import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { Args } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "./use-networks";

const getTemperatureFromResult = (result: any): number => {
    if (!result || !result.return_values || result.return_values.length === 0) {
        return 7; // default value is 0.7
    }

    try {
        // Handle DecimalValue format values
        const returnValue = result.return_values[0];

        // If not in DecimalValue format, try direct parsing
        const temperature = parseInt(returnValue.decoded_value.value.value.toString() || "7");

        // Ensure we return a valid number
        return isNaN(temperature) ? 7 : temperature;
    } catch (error) {
        console.error("Error parsing temperature value:", error);
        return 7; // default value is 0.7
    }
};

export function useAgentTemperature(agentId: string | undefined) {
    const client = useRoochClient();
    const packageId = useNetworkVariable("packageId");

    return useQuery({
        queryKey: ["agent", "temperature", agentId],
        queryFn: async () => {
            if (!agentId) return undefined;

            try {
                // Call the contract function to get the agent's temperature
                const result = await client.executeViewFunction({
                    target: `${packageId}::agent::get_agent_temperature`,
                    args: [Args.objectId(agentId)],
                });

                // Debug log
                console.log("Temperature API response:", JSON.stringify(result, null, 2));

                return getTemperatureFromResult(result);
            } catch (error) {
                console.error("Failed to get agent temperature:", error);
                return 7; // default value is 0.7
            }
        },
        enabled: !!agentId,
    });
} 