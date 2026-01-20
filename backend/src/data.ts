export interface Category {
    id: string;
    name: string;
    words: string[];
}

export const CATEGORIES: Category[] = [
    {
        id: '90s_pop',
        name: '90s Pop Music',
        words: [
            'Spice Girls', 'Britney Spears', 'Backstreet Boys', "N'Sync", 'Aqua',
            'Christina Aguilera', 'Hanson', 'TLC', 'Destiny\'s Child', 'Ricky Martin',
            'Savage Garden', 'Ace of Base'
        ]
    },
    {
        id: 'fruits',
        name: 'Fruits',
        words: [
            'Apple', 'Banana', 'Orange', 'Strawberry', 'Grape',
            'Watermelon', 'Pineapple', 'Mango', 'Blueberry', 'Peach',
            'Kiwi', 'Cherry'
        ]
    },
    {
        id: 'languages',
        name: 'Programming Languages',
        words: [
            'TypeScript', 'JavaScript', 'Python', 'Java', 'C++',
            'Rust', 'Go', 'Ruby', 'Swift', 'Kotlin',
            'PHP', 'C#'
        ]
    },
    {
        id: 'animals',
        name: 'Zoo Animals',
        words: [
            'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra',
            'Monkey', 'Penguin', 'Kangaroo', 'Panda', 'Gorilla',
            'Hippo', 'Rhino'
        ]
    },
    {
        id: 'cities',
        name: 'Major Cities',
        words: [
            'London', 'New York', 'Tokyo', 'Paris', 'Dubai',
            'Singapore', 'Barcelona', 'Los Angeles', 'Rome', 'Istanbul',
            'Sydney', 'Mumbai'
        ]
    }
];
