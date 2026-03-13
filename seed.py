import requests
import random
from datetime import datetime, timedelta

BASE = "http://localhost:8080/api"

EXPENSE_CATEGORIES = [
    "Food", "Transport", "Housing", "Utilities", "Healthcare",
    "Entertainment", "Clothing", "Education", "Travel", "Sports",
    "Subscriptions", "Dining Out", "Groceries", "Insurance", "Gifts",
    "Electronics", "Beauty", "Pets", "Repairs", "Savings"
]

INCOME_CATEGORIES = [
    "Salary", "Freelance", "Investments", "Rental", "Side Business",
    "Dividends", "Bonuses", "Royalties", "Grants"
]

EXPENSE_TOPICS = [
    "Weekly groceries", "Bus ticket", "Electricity bill", "Doctor visit",
    "Movie night", "New shoes", "Online course", "Hotel booking",
    "Gym membership", "Netflix", "Lunch", "Coffee", "Phone bill",
    "Car service", "Birthday gift", "Laptop bag", "Haircut", "Vet visit",
    "Plumber", "Book", "Dinner out", "Taxi", "Internet", "Pharmacy",
    "Clothes shopping", "Museum ticket", "Train pass", "Festival ticket",
    "Sports gear", "Headphones"
]

INCOME_TOPICS = [
    "Monthly salary", "Client payment", "Stock dividends", "Rent received",
    "Project bonus", "Consulting fee", "Side gig payment", "Royalty payment",
    "Grant disbursement", "Overtime pay", "Commission", "Freelance project",
    "Performance bonus", "Interest income", "Part-time work"
]

def random_timestamp():
    now = datetime.now()
    days_ago = random.randint(0, 365)
    dt = now - timedelta(days=days_ago)
    return int(dt.timestamp() * 1000)

def create_user(i):
    payload = {
        "name": f"user{i}",
        "email": f"user{i}@example.com",
        "password": "password123"
    }
    r = requests.post(f"{BASE}/users", json=payload)
    if r.status_code == 200:
        user = r.json()
        print(f"  Created user: {user['name']} (id={user['id']})")
        return user
    else:
        print(f"  Failed to create user{i}: {r.status_code} {r.text}")
        return None

def create_category(user_id, name, type_):
    payload = {"name": name, "userId": user_id, "type": type_}
    r = requests.post(f"{BASE}/categories", json=payload)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"    Failed to create category '{name}': {r.status_code} {r.text}")
        return None

def create_transaction(user_id, category_name, type_, topic, amount):
    payload = {
        "userId": user_id,
        "categoryName": category_name,
        "type": type_,
        "topic": topic,
        "income": amount,
        "date": random_timestamp()
    }
    r = requests.post(f"{BASE}/transactions", json=payload)
    if r.status_code != 200:
        print(f"    Failed to create transaction: {r.status_code} {r.text}")

def seed():
    print("Seeding database...")

    for i in range(1, 11):
        print(f"\n[User {i}/10]")
        user = create_user(i)
        if not user:
            continue
        user_id = user["id"]

        # EXPENSE categories: 3–10
        num_expense_cats = random.randint(3, 10)
        expense_cat_names = random.sample(EXPENSE_CATEGORIES, num_expense_cats)
        print(f"  EXPENSE categories ({num_expense_cats}):")
        for cat_name in expense_cat_names:
            cat = create_category(user_id, cat_name, "EXPENSE")
            if not cat:
                continue
            num_tx = random.randint(0, 30)
            print(f"    '{cat_name}': {num_tx} transactions")
            for _ in range(num_tx):
                topic = random.choice(EXPENSE_TOPICS)
                amount = round(random.uniform(5, 500), 2)
                create_transaction(user_id, cat_name, "EXPENSE", topic, amount)

        # INCOME categories: 1–5
        num_income_cats = random.randint(1, 5)
        income_cat_names = random.sample(INCOME_CATEGORIES, num_income_cats)
        print(f"  INCOME categories ({num_income_cats}):")
        for cat_name in income_cat_names:
            cat = create_category(user_id, cat_name, "INCOME")
            if not cat:
                continue
            print(f"    '{cat_name}': 5 transactions")
            for _ in range(5):
                topic = random.choice(INCOME_TOPICS)
                amount = round(random.uniform(500, 5000), 2)
                create_transaction(user_id, cat_name, "INCOME", topic, amount)

    print("\nDone!")

if __name__ == "__main__":
    seed()
