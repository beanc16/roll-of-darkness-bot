import { PaginationActionRowBuilder, PaginationButtonName } from '../../../../src/commands-slash/strategies/PaginationStrategy/components/PaginationActionRowBuilder.js';

/*
+ Array [
+   Object {
+     "custom_id": "first_page",
+     "disabled": false,
+     "emoji": "⏪",
+     "label": "First",
+     "style": 2,
+     "type": 2,
+     "url": undefined,
+   },
+   Object {
+     "custom_id": "previous_page",
+     "disabled": false,
+     "emoji": "⬅️",
+     "label": "Previous",
+     "style": 2,
+     "type": 2,
+     "url": undefined,
+   },
+   Object {
+     "custom_id": "next_page",
+     "disabled": false,
+     "emoji": "➡️",
+     "label": "Next",
+     "style": 2,
+     "type": 2,
+     "url": undefined,
+   },
+   Object {
+     "custom_id": "last_page",
+     "disabled": false,
+     "emoji": "⏩",
+     "label": "Last",
+     "style": 2,
+     "type": 2,
+     "url": undefined,
+   },
+ ]
*/

describe('PaginationActionRowBuilder', () =>
{
    describe('constructor', () =>
    {
        it('should create with no components', () =>
        {
            const paginationActionRowBuilder = new PaginationActionRowBuilder({
                isDisabled: false,
                includeDeleteButton: false,
                includePaginationButtons: false,
            });

            expect(paginationActionRowBuilder.components).toEqual([]);
        });

        it('should create with pagination buttons', () =>
        {
            const paginationActionRowBuilder = new PaginationActionRowBuilder({
                isDisabled: false,
                includeDeleteButton: false,
                includePaginationButtons: true,
            });

            expect(paginationActionRowBuilder.components.length).toEqual(4);
            expect(paginationActionRowBuilder.components[0].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.First,
            });
            expect(paginationActionRowBuilder.components[1].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Previous,
            });
            expect(paginationActionRowBuilder.components[2].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Next,
            });
            expect(paginationActionRowBuilder.components[3].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Last,
            });
        });

        it('should create with delete button', () =>
        {
            const paginationActionRowBuilder = new PaginationActionRowBuilder({
                isDisabled: false,
                includeDeleteButton: true,
                includePaginationButtons: false,
            });

            expect(paginationActionRowBuilder.components.length).toEqual(1);
            expect(paginationActionRowBuilder.components[0].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Delete,
            });
        });

        it('should create disabled buttons', () =>
        {
            const paginationActionRowBuilder = new PaginationActionRowBuilder({
                isDisabled: true,
                includeDeleteButton: true,
                includePaginationButtons: true,
            });

            expect(paginationActionRowBuilder.components.length).toEqual(5);
            expect(paginationActionRowBuilder.components[0].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.First,
                disabled: true,
            });
            expect(paginationActionRowBuilder.components[1].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Previous,
                disabled: true,
            });
            expect(paginationActionRowBuilder.components[2].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Delete,
                disabled: true,
            });
            expect(paginationActionRowBuilder.components[3].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Next,
                disabled: true,
            });
            expect(paginationActionRowBuilder.components[4].toJSON()).toMatchObject({
                custom_id: PaginationButtonName.Last,
                disabled: true,
            });
        });
    });

    describe('method: hasComponents', () =>
    {
        it('should return false if there are no components', () =>
        {
            const paginationActionRowBuilder = new PaginationActionRowBuilder({
                isDisabled: false,
                includeDeleteButton: false,
                includePaginationButtons: false,
            });

            expect(paginationActionRowBuilder.hasComponents).toEqual(false);
        });
    });
});
