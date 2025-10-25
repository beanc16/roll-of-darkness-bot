import { Queue, QueuePosition } from './Queue.js';

describe('Queue', () =>
{
    let queue: Queue<string>;

    beforeEach(() =>
    {
        queue = new Queue({ shouldLoop: false });
    });

    it('enqueue to LAST adds item at the end', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        expect(queue.elements).toEqual(['a', 'b']);
    });

    it('enqueue to NEXT adds after current index', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        queue.enqueue('c', QueuePosition.Next);

        expect(queue.elements).toEqual(['a', 'c', 'b']);
    });

    it('next moves to next element', () =>
    {
        queue['queue'] = ['a', 'b', 'c'];
        queue.next();

        expect(queue['currentIndex']).toEqual(1);
    });

    it('dequeue removes current item and shifts index if needed', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        queue.enqueue('c', QueuePosition.Last);

        const removed = queue.dequeue();
        expect(removed).toEqual('a');
        expect(queue.elements).toEqual(['b', 'c']);
        expect(queue.current).toEqual('b');
    });

    it('dequeue removes current item and shifts index if it would be out of bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        queue.enqueue('c', QueuePosition.Last);
        queue['currentIndex'] = 2;

        const removed = queue.dequeue();
        expect(removed).toEqual('c');
        expect(queue.elements).toEqual(['a', 'b']);
        expect(queue.current).toEqual('b');
        expect(queue['currentIndex']).toEqual(1);
    });

    it('dequeue on empty returns undefined', () =>
    {
        expect(queue.dequeue()).toBeUndefined();
    });

    it('update by index modifies the correct item', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const result = queue.update(1, 'newB');
        expect(result).toEqual(true);
        expect(queue.elements).toEqual(['a', 'newB']);
    });

    it('update by predicate modifies the correct item', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const result = queue.update((item) => item === 'b', 'newB');
        expect(result).toEqual(true);
        expect(queue.elements).toEqual(['a', 'newB']);
    });

    it('update by index modifies nothing if index is out of bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const result = queue.update(2, 'newC');
        expect(result).toEqual(false);
        expect(queue.elements).toEqual(['a', 'b']);
    });

    it('update by predicate modifies nothing if element is not found', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const result = queue.update((item) => item === 'c', 'newC');
        expect(result).toEqual(false);
        expect(queue.elements).toEqual(['a', 'b']);
    });

    it('remove by index removes the correct item', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const removed = queue.remove(0);
        expect(removed).toEqual('a');
        expect(queue.elements).toEqual(['b']);
    });

    it('remove by predicate removes correct item', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const removed = queue.remove((item) => item === 'b');
        expect(removed).toEqual('b');
        expect(queue.elements).toEqual(['a']);
    });

    it('remove by index removes the correct item and shifts index if it would be out of bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        queue['currentIndex'] = 1;

        const removed = queue.remove(1);
        expect(removed).toEqual('b');
        expect(queue.elements).toEqual(['a']);
        expect(queue['currentIndex']).toEqual(0);
    });

    it('remove by index removes nothing if index is out of bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const removed = queue.remove(2);
        expect(removed).toBeUndefined();
        expect(queue.elements).toEqual(['a', 'b']);
    });

    it('remove by predicate removes nothing if index is out of bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        const removed = queue.remove((item) => item === 'c');
        expect(removed).toBeUndefined();
        expect(queue.elements).toEqual(['a', 'b']);
    });

    it('next moves forward and respects bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        queue.enqueue('c', QueuePosition.Last);

        expect(queue.current).toEqual('a');
        expect(queue.next()).toEqual('b');
        expect(queue.next()).toEqual('c');
        expect(queue.next()).toEqual('c'); // stays at end
    });

    it('previous moves backward and respects bounds', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        queue.next(); // move to b

        expect(queue.previous()).toEqual('a');
        expect(queue.previous()).toEqual('a'); // stays at start
    });

    it('next and previous loop correctly when shouldLoop is true', () =>
    {
        queue = new Queue({ shouldLoop: true });
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);

        // Loop forward
        expect(queue.current).toEqual('a');
        expect(queue.next()).toEqual('b');
        expect(queue.next()).toEqual('a'); // loop to start

        // Loop backward
        expect(queue.previous()).toEqual('b'); // loop to end
    });

    it('clear empties the queue and resets index', () =>
    {
        queue.enqueue('a', QueuePosition.Last);
        queue.enqueue('b', QueuePosition.Last);
        expect(queue.elements).toEqual(['a', 'b']);

        queue.clear();
        expect(queue.elements).toEqual([]);
        expect(queue.current).toBeUndefined();
    });

    it('updateSettings modifies shouldLoop correctly', () =>
    {
        expect(queue['shouldLoop']).toEqual(false);
        queue.updateSettings({ shouldLoop: true });
        expect(queue['shouldLoop']).toEqual(true);
    });

    it('length reflects current queue size', () =>
    {
        expect(queue.length).toEqual(0);
        queue.enqueue('a', QueuePosition.Last);
        expect(queue.length).toEqual(1);
    });
});
