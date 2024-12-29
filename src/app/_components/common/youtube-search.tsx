"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useDebounce } from "@uidotdev/usehooks";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface YouTubeSearchProps {
  onChange: (data: { id: string; type: "video" | "channel"; title: string; thumbnail: string } | null) => void;
  value: { id: string; type: "video" | "channel"; title: string; thumbnail: string } | null;
}

const YouTubeSearch: React.FC<YouTubeSearchProps> = ({ onChange, value }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const query = useDebounce(searchTerm, 300);
  const { data, isLoading } = api.youtube.search.useQuery(query, { enabled: !!query });

  const handleSelect = (selectedId: string, type: "video" | "channel") => {
    const selectedItem = data?.items?.find((item) => {
      if (type === "video") {
        return item.id?.videoId === selectedId;
      } else {
        return item.id?.channelId === selectedId;
      }
    });

    if (!selectedItem) return;

    onChange({
      id: selectedId,
      type,
      title: selectedItem.snippet?.title || "",
      thumbnail: selectedItem.snippet?.thumbnails?.default?.url || "",
    });

    setSearchTerm("");
  };

  return (
    <div className="relative">
      {value ? (
        <Card className="bg-background">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {value.thumbnail && (
                <div className={value.type === "video" ? "w-24 aspect-video" : "w-12 h-12 aspect-square"}>
                  <img src={value.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                </div>
              )}
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">[{value.type === "video" ? "Video" : "Channel"}]</span>
                <div className="text-sm">{value.title}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onChange(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Input placeholder="Search Video/Channel Name" onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
          {isLoading && <p className="text-sm text-muted-foreground mt-2">Loading...</p>}
          {data && (
            <Card className="mt-1">
              <ScrollArea className="h-[300px]">
                <Command>
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {data.items?.map((item, index) => (
                        <CommandItem key={item.id?.channelId || item.id?.videoId || index} onSelect={() => handleSelect(item.id?.channelId ?? item.id?.videoId ?? "", item.id?.channelId ? "channel" : "video")} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            {item.snippet?.thumbnails?.default?.url && (
                              <div className={item.id?.videoId ? "w-24 aspect-video" : "w-12 h-12 aspect-square"}>
                                <img src={item.snippet.thumbnails.default.url} alt="" className="w-full h-full object-cover rounded" />
                              </div>
                            )}
                            <div>
                              <span className="text-sm text-muted-foreground group-data-[selected=true]:text-accent-foreground">{item.id?.videoId ? "[Video]" : item.id?.channelId ? "[Channel]" : "[Playlist]"}</span>
                              <div className="text-sm">{item.snippet?.title}</div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </ScrollArea>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default YouTubeSearch;
