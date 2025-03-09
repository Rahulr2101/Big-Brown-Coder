
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins } from "lucide-react";



const WalletCard= ({
  account,
  ethBalance,
  tokenBalance,
  connectWallet,
}) => {
  return (
    <Card className="card-shadow">
      <CardHeader className="bg-eco-light border-b border-eco/20">
        <CardTitle className="flex items-center gap-2 text-eco-dark">
          <Wallet className="h-5 w-5" />
          Your Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-4">
        <div className="space-y-4">
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground mb-1">Account</p>
            <p className="font-medium truncate">
              {account === "Not connected" ? (
                "Not connected"
              ) : (
                <>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground mb-1">ETH Balance</p>
              <p className="font-medium">{ethBalance.toFixed(4)} ETH</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground mb-1">Carbon Tokens</p>
              <div className="flex items-center gap-1 font-medium">
                <Coins className="h-4 w-4 text-eco" />
                <span>{tokenBalance}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={connectWallet}
            className="w-full bg-eco hover:bg-eco-dark text-white"
          >
            {account === "Not connected" ? "Connect Wallet" : "Refresh Balance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
