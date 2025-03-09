import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Globe, TrendingUp } from "lucide-react";



const OffsetPurchase = ({
  tokenPrice,
  recommendedOffsets,
  account,
}) => {
  const [offsetAmount, setOffsetAmount] = useState(recommendedOffsets || 1);
  
  const handleSliderChange = (value) => {
    setOffsetAmount(value[0]);
  };
  
  const handlePurchase = () => {
    if (account === "Not connected") {
      toast.error("Please connect your wallet first");
      return;
    }
    
    toast.success(`Successfully purchased ${offsetAmount} carbon offset tokens!`);
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="bg-eco-light border-b border-eco/20">
        <CardTitle className="flex items-center gap-2 text-eco-dark">
          <Globe className="h-5 w-5" />
          Purchase Carbon Offsets
        </CardTitle>
        <CardDescription>
          Offset your carbon footprint by purchasing carbon credits
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-4">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground mb-1">Token Price</p>
              <p className="text-xl font-medium flex items-center">
                {tokenPrice} <span className="text-sm ml-1">ETH</span>
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground mb-1">Recommended</p>
              <p className="text-xl font-medium flex items-center">
                {recommendedOffsets} <span className="text-sm ml-1">Tokens</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="offset-amount" className="text-sm font-medium">
                Carbon Offset Amount
              </Label>
              <span className="text-sm font-medium">{offsetAmount} tokens</span>
            </div>
            <Slider
              id="offset-amount"
              defaultValue={[offsetAmount]}
              max={20}
              min={1}
              step={1}
              onValueChange={handleSliderChange}
              className="my-4"
            />
          </div>
          
          <div className="rounded-lg bg-eco-light/50 p-4 border border-eco/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Cost:</p>
              <p className="text-lg font-bold text-eco-dark">
                {(offsetAmount * tokenPrice).toFixed(3)} ETH
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-eco" />
              <span>Offsets approximately {offsetAmount * 1000}kg of CO₂</span>
            </div>
          </div>
          
          <Button
            onClick={handlePurchase}
            className="w-full bg-eco hover:bg-eco-dark text-white"
          >
            Purchase Carbon Offsets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OffsetPurchase;
