
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf } from "lucide-react";



const FootprintCalculator = ({
  inputs,
  handleChange,
  calculateFootprint,
  footprintEstimate,
}) => {
  const formatInputLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInputUnit = (key) => {
    switch (key) {
      case "electricityUsage":
        return "kWh/month";
      case "gasUsage":
        return "therms/month";
      case "carTravel":
        return "miles/week";
      case "flightHours":
        return "hours/year";
      case "meatConsumption":
        return "servings/week";
      default:
        return "";
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="bg-eco-light border-b border-eco/20">
        <CardTitle className="flex items-center gap-2 text-eco-dark">
          <Leaf className="h-5 w-5" />
          Calculate Your Carbon Footprint
        </CardTitle>
        <CardDescription>
          Enter your usage details to estimate your carbon footprint
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-4">
        <form onSubmit={calculateFootprint} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(inputs).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium">
                  {formatInputLabel(key)}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    name={key}
                    value={inputs[key ]}
                    onChange={handleChange}
                    className="form-input pr-16"
                    placeholder="0"
                    required
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {getInputUnit(key)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-secondary p-4 mt-6">
            <p className="text-sm font-medium mb-1">Estimated Carbon Footprint:</p>
            <p className="text-3xl font-bold text-eco-dark">
              {footprintEstimate.toFixed(1)} <span className="text-base font-normal">kg CO₂e</span>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-eco hover:bg-eco-dark text-white"
          >
            Calculate Footprint
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FootprintCalculator;
