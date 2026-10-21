
import numpy as np
import matplotlib.pyplot as plt
students = ["Asha", "Ravi", "Maya", "Arun", "Diya"]
marks = np.array([78, 85, 92, 67, 88])
average = np.mean(marks)
highest = np.max(marks)
lowest = np.min(marks)
print("STUDENT MARKS REPORT")
print("-" * 25)
for name, mark in zip(students, marks):
    print(f"{name}: {mark}/100")
print(f"\nClass average: {average:.1f}")
print(f"Highest mark: {highest}")
print(f"Lowest mark: {lowest}")
plt.bar(students, marks)
plt.axhline(average, linestyle="--", label="Class average")
plt.ylim(0, 100)
plt.ylabel("Marks out of 100")
plt.title("Student Marks Analysis")
plt.legend()
plt.tight_layout()
plt.show()
