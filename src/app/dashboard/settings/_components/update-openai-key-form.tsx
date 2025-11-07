"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "openai_api_key";

export function UpdateOpenAIKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    // Load existing key from localStorage on mount
    const existingKey = localStorage.getItem(STORAGE_KEY);
    if (existingKey) {
      setApiKey(existingKey);
      setHasExistingKey(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      toast.error("Invalid API key format. OpenAI keys start with 'sk-'");
      return;
    }

    localStorage.setItem(STORAGE_KEY, apiKey.trim());
    setHasExistingKey(true);
    toast.success("OpenAI API Key saved successfully");
  };

  const handleDelete = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    setHasExistingKey(false);
    toast.success("OpenAI API Key removed");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="openai-key">OpenAI API Key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="openai-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button onClick={handleSave} size="default">
            <Key className="size-4 mr-2" />
            Save
          </Button>
          {hasExistingKey && (
            <Button onClick={handleDelete} variant="destructive" size="default">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Your API key is stored locally in your browser and never sent to our
          servers.
        </p>
        {!hasExistingKey && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Without an API key, the AI chat assistant will not work.
          </p>
        )}
      </div>

      <div className="rounded-lg bg-muted p-4 space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Key className="size-4" />
          How to get your OpenAI API Key
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>
            Visit{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenAI Platform
            </a>
          </li>
          <li>Sign in or create an account</li>
          <li>Navigate to API Keys section</li>
          <li>Click "Create new secret key"</li>
          <li>Copy and paste the key above</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-2">
          Note: You may need to add billing information to use the OpenAI API.
        </p>
      </div>
    </div>
  );
}
