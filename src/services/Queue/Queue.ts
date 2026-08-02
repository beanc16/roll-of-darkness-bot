interface QueueSettings
{
    shouldLoop: boolean;
}

export enum QueuePosition
{
    Next = 'Next',
    Last = 'Last',
}

export class Queue<Element>
{
    private queue: Element[] = [];
    private currentIndex: number = 0;
    private shouldLoop: boolean = false;

    constructor({ shouldLoop }: QueueSettings)
    {
        this.shouldLoop = shouldLoop;
    }

    get length(): number
    {
        return this.queue.length;
    }

    get elements(): Element[]
    {
        return [...this.queue];
    }

    get settings(): { shouldLoop: boolean }
    {
        return {
            shouldLoop: this.shouldLoop,
        };
    }

    public enqueue(item: Element, position: QueuePosition): void
    {
        if (position === QueuePosition.Next)
        {
            this.queue.splice(this.currentIndex + 1, 0, item);
        }

        else
        {
            this.queue.push(item);
        }
    }

    public dequeue(): Element | undefined
    {
        if (this.queue.length === 0)
        {
            return undefined;
        }

        // Remove element
        const [removedElement] = this.queue.splice(this.currentIndex, 1);

        // Update index
        if (this.currentIndex >= this.queue.length)
        {
            this.currentIndex = Math.max(0, this.queue.length - 1);
        }

        return removedElement;
    }

    public find(predicate: (item: Element, index: number) => boolean): {
        element: Element;
        index: number;
    } | undefined
    {
        const index = this.queue.findIndex(predicate);

        if (index === -1)
        {
            return undefined;
        }

        return {
            element: this.queue[index],
            index,
        };
    }

    public update(index: number, newItem: Partial<Element>, position?: QueuePosition | null): boolean;
    public update(predicate: (item: Element, index: number) => boolean, newItem: Element, position?: QueuePosition | null): boolean;
    public update(indexOrPredicate: number | ((item: Element, index: number) => boolean), newItem: Element, position?: QueuePosition | null): boolean
    {
        if (typeof indexOrPredicate === 'number')
        {
            return this.updateAtIndex(indexOrPredicate, newItem, position);
        }

        return this.updateByPredicate(indexOrPredicate, newItem, position);
    }

    private updateAtIndex(index: number, newItem: Element, position?: QueuePosition | null): boolean
    {
        // Check if index is valid
        if (index < 0 || index >= this.queue.length)
        {
            return false;
        }

        // Update the element
        this.queue[index] = newItem;

        // Update the position if one is given
        if (position === QueuePosition.Next)
        {
            this.enqueue(this.queue[index], QueuePosition.Next);
            this.remove(index + 1);
        }
        else if (position === QueuePosition.Last)
        {
            this.enqueue(this.queue[index], QueuePosition.Last);
            this.remove(index);
        }

        return true;
    }

    private updateByPredicate(predicate: (item: Element, index: number) => boolean, newItem: Element, position?: QueuePosition | null): boolean
    {
        const index = this.queue.findIndex(predicate);

        // Check if index is valid
        if (index === -1)
        {
            return false;
        }

        // Update the element
        this.queue[index] = newItem;

        // Update the position if one is given
        if (position === QueuePosition.Next)
        {
            this.enqueue(this.queue[index], QueuePosition.Next);
            this.remove(index + 1);
        }
        else if (position === QueuePosition.Last)
        {
            this.enqueue(this.queue[index], QueuePosition.Last);
            this.remove(index);
        }

        return true;
    }

    public remove(index: number): Element | undefined;
    public remove(predicate: (item: Element, index: number) => boolean): Element | undefined;
    public remove(indexOrPredicate: number | ((item: Element, index: number) => boolean)): Element | undefined
    {
        if (typeof indexOrPredicate === 'number')
        {
            return this.removeAtIndex(indexOrPredicate);
        }

        return this.removeByPredicate(indexOrPredicate);
    }

    private removeAtIndex(index: number): Element | undefined
    {
        // Check if index is valid
        if (index < 0 || index >= this.queue.length)
        {
            return undefined;
        }

        const [removedElement] = this.queue.splice(index, 1);

        if (this.currentIndex >= this.queue.length)
        {
            this.currentIndex = Math.max(0, this.queue.length - 1);
        }

        return removedElement;
    }

    private removeByPredicate(predicate: (item: Element, index: number) => boolean): Element | undefined
    {
        const index = this.queue.findIndex(predicate);

        if (index === -1)
        {
            return undefined;
        }

        return this.removeAtIndex(index);
    }

    get current(): Element | undefined
    {
        return this.queue[this.currentIndex];
    }

    public next(): Element | undefined
    {
        if (this.currentIndex < this.queue.length - 1)
        {
            this.currentIndex += 1;
        }
        else if (this.shouldLoop)
        {
            this.currentIndex = 0;
        }

        return this.current;
    }

    public previous(): Element | undefined
    {
        if (this.currentIndex > 0)
        {
            this.currentIndex -= 1;
        }
        else if (this.shouldLoop)
        {
            this.currentIndex = this.queue.length - 1;
        }

        return this.current;
    }

    public clear(): void
    {
        this.queue = [];
        this.currentIndex = 0;
    }

    public updateSettings({ shouldLoop }: QueueSettings): void
    {
        this.shouldLoop = shouldLoop;
    }
}
