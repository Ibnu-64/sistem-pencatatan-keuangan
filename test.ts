type noteFaincance = {
    type: 'income' | 'expense',
    item: Date,
    amount: number,
    category: string,
    description: string, // optional
}