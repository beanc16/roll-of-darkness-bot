import { Queue, QueuePosition } from '../../src/services/Queue.js';

describe('Queue', () =>
{
    let queue: Queue<string>;

    beforeEach(() =>
    {
        queue = new Queue({ shouldLoop: false });
    });

    describe('property: length', () =>
    {
        it('length reflects current queue size', () =>
        {
            expect(queue.length).toEqual(0);
            queue.enqueue('a', QueuePosition.Last);
            expect(queue.length).toEqual(1);
        });
    });

    describe('method: enqueue', () =>
    {
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
    });

    describe('method: dequeue', () =>
    {
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
    });

    describe('method: find', () =>
    {
        it('find returns correct item', () =>
        {
            queue.enqueue('a', QueuePosition.Last);
            queue.enqueue('b', QueuePosition.Last);
            queue.enqueue('c', QueuePosition.Last);

            const result = queue.find((item) => item === 'b');
            expect(result).toEqual({ element: 'b', index: 1 });
        });

        it('find returns undefined if item does not exist', () =>
        {
            queue.enqueue('a', QueuePosition.Last);
            queue.enqueue('b', QueuePosition.Last);
            queue.enqueue('c', QueuePosition.Last);

            const result = queue.find((item) => item === 'd');
            expect(result).toBeUndefined();
        });
    });

    describe('method: update', () =>
    {
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

        it.each([
            [0, QueuePosition.Last, ['b', 'c', 'a']],
            [2, QueuePosition.Next, ['a', 'c', 'b']],
        ])(`update by index modifies the item at index %s to the "%s" position in the queue`, (index, queuePosition, expectedResult) =>
        {
            queue.enqueue('a', QueuePosition.Last);
            queue.enqueue('b', QueuePosition.Last);
            queue.enqueue('c', QueuePosition.Last);

            const result = queue.update(index, queue['elements'][index], queuePosition);
            expect(result).toEqual(true);
            expect(queue.elements).toEqual(expectedResult);
        });

        it.each([
            ['a', QueuePosition.Last, ['b', 'c', 'a']],
            ['c', QueuePosition.Next, ['a', 'c', 'b']],
        ])(`update by predicate modifies the item equal to "%s" to the "%s" position in the queue`, (element, queuePosition, expectedResult) =>
        {
            queue.enqueue('a', QueuePosition.Last);
            queue.enqueue('b', QueuePosition.Last);
            queue.enqueue('c', QueuePosition.Last);

            const result = queue.update((item) => item === element, element, queuePosition);
            expect(result).toEqual(true);
            expect(queue.elements).toEqual(expectedResult);
        });

        it(`update by predicate modifies the correct item's position in the queue`, () =>
        {
            queue.enqueue('a', QueuePosition.Last);
            queue.enqueue('b', QueuePosition.Last);
            queue.enqueue('c', QueuePosition.Last);

            const result = queue.update((item) => item === 'a', queue['elements'][0], QueuePosition.Last);
            expect(result).toEqual(true);
            expect(queue.elements).toEqual(['b', 'c', 'a']);
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
    });

    describe('method: remove', () =>
    {
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
    });

    describe('method: next', () =>
    {
        it('next moves to next element', () =>
        {
            queue['queue'] = ['a', 'b', 'c'];
            queue.next();

            expect(queue['currentIndex']).toEqual(1);
        });

        it('next moves forward and respects bounds', () =>
        {
            queue['queue'] = ['a', 'b', 'c'];

            expect(queue.current).toEqual('a');
            expect(queue.next()).toEqual('b');
            expect(queue.next()).toEqual('c');
            expect(queue.next()).toEqual('c'); // stays at end
        });

        it('next does nothing if queue is empty', () =>
        {
            expect(queue.next()).toBeUndefined();
            expect(queue['currentIndex']).toEqual(0);
        });
    });

    describe('method: previous', () =>
    {
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

        it('previous does nothing if queue is empty', () =>
        {
            expect(queue.previous()).toBeUndefined();
            expect(queue['currentIndex']).toEqual(0);
        });
    });

    describe('method: clear', () =>
    {
        it('clear empties the queue and resets index', () =>
        {
            queue.enqueue('a', QueuePosition.Last);
            queue.enqueue('b', QueuePosition.Last);
            expect(queue.elements).toEqual(['a', 'b']);

            queue.clear();
            expect(queue.elements).toEqual([]);
            expect(queue.current).toBeUndefined();
        });

        it('clear does nothing if queue is empty', () =>
        {
            expect(queue.elements).toEqual([]);
            expect(queue.current).toBeUndefined();
            queue.clear();
            expect(queue.elements).toEqual([]);
            expect(queue.current).toBeUndefined();
        });
    });

    describe('method: updateSettings', () =>
    {
        it('updateSettings modifies shouldLoop correctly', () =>
        {
            expect(queue['shouldLoop']).toEqual(false);
            queue.updateSettings({ shouldLoop: true });
            expect(queue['shouldLoop']).toEqual(true);
        });
    });
});
