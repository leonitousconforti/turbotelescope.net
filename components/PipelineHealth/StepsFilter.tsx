"use client";

import { useRx } from "@effect-rx/rx-react";

import { steps2queryRx } from "@/components/PipelineHealth/rx";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShortPipelineName } from "@/services/Domain";

export function Steps2querySelector() {
    const [steps2query, setSteps2query] = useRx(steps2queryRx);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <span>Select Steps to Query</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuItem
                    onSelect={(event) => {
                        event.preventDefault();
                        setSteps2query(new Set(ShortPipelineName.to.literals));
                    }}
                >
                    Select All
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={(event) => {
                        event.preventDefault();
                        setSteps2query(new Set());
                    }}
                >
                    Unselect All
                </DropdownMenuItem>
                {ShortPipelineName.to.literals.map((shortName, i) => {
                    return (
                        <DropdownMenuCheckboxItem
                            key={i}
                            checked={steps2query.has(shortName)}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={(checked) => {
                                if (checked == true) {
                                    setSteps2query(steps2query.union(new Set([shortName])));
                                } else {
                                    setSteps2query(steps2query.difference(new Set([shortName])));
                                }
                            }}
                        >
                            {shortName}
                        </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
