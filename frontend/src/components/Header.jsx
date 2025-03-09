import React from "react";
import { Leaf } from "lucide-react";

const Header= () => {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-full bg-eco flex items-center justify-center animate-pulse-slow">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Carbon<span className="text-eco">Eco</span>Balance
        </h1>
      </div>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Calculate your carbon footprint and offset it with blockchain-based carbon credits.
        Each purchase directly funds verified climate projects worldwide.
      </p>
    </div>
  );
};

export default Header;
