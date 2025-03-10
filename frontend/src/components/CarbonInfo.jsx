
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleHelp, Leaf, Info } from "lucide-react";

const CarbonInfo = () => {
  return (
    <Card className="card-shadow">
      <CardHeader className="bg-eco-light border-b border-eco/20">
        <CardTitle className="flex items-center gap-2 text-eco-dark">
          <Info className="h-5 w-5" />
          Carbon Offset Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4 text-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-1">
              <Leaf className="h-4 w-4 text-eco" />
              What are carbon offsets?
            </h3>
            <p className="text-muted-foreground">
              Carbon offsets represent reductions in greenhouse gases to compensate for emissions made elsewhere. Each token represents 1 ton of CO₂ removed or avoided.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-1">
              <CircleHelp className="h-4 w-4 text-eco" />
              How does this work?
            </h3>
            <p className="text-muted-foreground">
              1. Calculate your carbon footprint using our tool
              <br />
              2. Purchase the recommended amount of carbon offset tokens
              <br />
              3. We fund verified climate projects worldwide to offset your emissions
            </p>
          </div>
          
          <div className="rounded-lg bg-eco-light/50 p-3 border border-eco/20">
            <p className="text-xs text-eco-dark">
              Our carbon offsets are verified by Gold Standard and Verra's Verified Carbon Standard, ensuring quality and real impact.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarbonInfo;
