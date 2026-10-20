import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalisationOptionsProps {
  senderName: string;
  receiverName: string;
  message: string;
  emailTemplate: string;
  onChange: (field: string, value: any) => void;
}

export const PersonalisationOptions: React.FC<PersonalisationOptionsProps> = ({
  senderName,
  receiverName,
  message,
  emailTemplate,
  onChange,
}) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Personalisation Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sender-name">Sender Name</Label>
            <Input
              id="sender-name"
              placeholder="Name of the sender"
              className="h-12"
              value={senderName}
              onChange={(e) => onChange("senderName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiver-name">Receiver Name</Label>
            <Input
              id="receiver-name"
              placeholder="Name of the receiver"
              className="h-12"
              value={receiverName}
              onChange={(e) => onChange("receiverName", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message / Note</Label>
          <Textarea
            id="message"
            placeholder="Write a personal message..."
            className="min-h-[100px] resize-none"
            value={message}
            onChange={(e) => onChange("message", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-template">Email Template</Label>
          <Select value={emailTemplate} onValueChange={(v) => onChange("emailTemplate", v)}>
            <SelectTrigger id="email-template" className="h-12">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">Birthday Celebration</SelectItem>
              <SelectItem value="anniversary">Anniversary Special</SelectItem>
              <SelectItem value="generic">Generic / Standard</SelectItem>
              <SelectItem value="festive">Festive Season</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
