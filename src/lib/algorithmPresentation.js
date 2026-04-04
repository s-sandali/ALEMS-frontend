import {
    Activity,
    Bubbles,
    Cpu,
    GitMerge,
    Rewind,
    Search,
    Zap,
} from "lucide-react";

const difficultyByAlgorithm = {
    "bubble sort": "Beginner",
    "binary search": "Intermediate",
    "insertion sort": "Beginner",
    "selection sort": "Beginner",
    "merge sort": "Intermediate",
    "quick sort": "Advanced",
    "heap sort": "Advanced",
};

const algorithmKeyByName = {
    "bubble sort": "bubble_sort",
    "binary search": "binary_search",
    "insertion sort": "insertion_sort",
    "selection sort": "selection_sort",
    "merge sort": "merge_sort",
    "quick sort": "quick_sort",
    "heap sort": "heap_sort",
};

const spaceComplexityByAlgorithm = {
    "bubble sort": "O(1)",
    "binary search": "O(1)",
    "insertion sort": "O(1)",
    "selection sort": "O(1)",
    "merge sort": "O(n)",
    "quick sort": "O(log n)",
    "heap sort": "O(1)",
};

const quizMetadataByAlgorithm = {
    "bubble sort": {
        available: true,
        questionCount: 5,
        xpReward: 50,
        timeMinutes: 3,
    },
    "binary search": {
        available: false,
        questionCount: 5,
        xpReward: 60,
        timeMinutes: 3,
    },
    "insertion sort": {
        available: false,
        questionCount: 6,
        xpReward: 65,
        timeMinutes: 4,
    },
    "selection sort": {
        available: false,
        questionCount: 6,
        xpReward: 65,
        timeMinutes: 4,
    },
    "merge sort": {
        available: false,
        questionCount: 6,
        xpReward: 75,
        timeMinutes: 4,
    },
    "quick sort": {
        available: false,
        questionCount: 6,
        xpReward: 75,
        timeMinutes: 4,
    },
    "heap sort": {
        available: false,
        questionCount: 7,
        xpReward: 80,
        timeMinutes: 5,
    },
};

const pseudocodeByAlgorithm = {
    "bubble sort": [
        "start with the unsorted array",
        "begin a new pass through the array",
        "compare adjacent elements",
        "swap them if left > right",
        "mark the largest unsorted value as placed",
        "finish when no unsorted elements remain",
    ],
    "binary search": [
        "set low = 0 and high = n - 1",
        "repeat while low <= high",
        "find the middle index",
        "return if the target matches the middle value",
        "discard the half that cannot contain the target",
        "stop when the search interval is empty",
    ],
    "insertion sort": [
        "treat the first element as a sorted prefix",
        "pick the next unsorted value as the key",
        "shift larger sorted values one position right",
        "insert the key into the opened position",
        "grow the sorted prefix by one element",
        "repeat until all values are inserted",
    ],
    "selection sort": [
        "start at the first unsorted position",
        "scan the remaining array for the minimum value",
        "remember the index of the smallest value found",
        "swap it into the current position",
        "grow the sorted prefix by one element",
        "repeat until the array is sorted",
    ],
    "merge sort": [
        "return when the array has one element",
        "split the array into left and right halves",
        "recursively sort the left half",
        "recursively sort the right half",
        "merge the sorted halves into one array",
        "return the merged result",
    ],
    "quick sort": [
        "return when the partition has zero or one element",
        "choose a pivot",
        "partition elements around the pivot",
        "place the pivot in its final position",
        "recursively sort the left partition",
        "recursively sort the right partition",
    ],
    "heap sort": [
        "build a max heap from the array",
        "swap the root with the last unsorted element",
        "shrink the heap boundary by one",
        "heapify the root to restore heap order",
        "repeat extraction until one element remains",
        "return the sorted array",
    ],
};

const codeSnippetsByAlgorithm = {
    "bubble sort": [
        {
            id: "pseudocode",
            label: "Pseudocode",
            language: "PSEUDOCODE",
            syncsWithTrace: true,
            traceLineMap: {
                1: [1, 2],
                2: [3, 4],
                3: [5, 6],
                4: [7, 8],
                5: 9,
                6: 10,
            },
            code: `function bubbleSort(arr)
n ← length(arr)
for i ← 0 to n-2
  swapped ← false
  for j ← 0 to n-i-2
    if arr[j] > arr[j+1]
      swap arr[j], arr[j+1]
      swapped ← true
  if not swapped: break
return arr`,
        },
        {
            id: "javascript",
            label: "JavaScript",
            language: "JAVASCRIPT",
            syncsWithTrace: false,
            code: `// Bubble Sort in JavaScript
function bubbleSort(arr) {
  let n = arr.length;

  // Outer loop for passes
  for (let i = 0; i < n - 1; i++) {
    // Inner loop for comparisons
    for (let j = 0; j < n - i - 1; j++) {
      // Swap if current element is greater than next
      if (arr[j] > arr[j + 1]) {
        // ES6 destructuring assignment for swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Usage example
const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
console.log("Unsorted array:", unsortedArray);
const sortedArray = bubbleSort(unsortedArray);
console.log("Sorted array:", sortedArray);`,
        },
        {
            id: "python",
            label: "Python",
            language: "PYTHON",
            syncsWithTrace: false,
            code: `# Bubble Sort in Python
def bubble_sort(arr):
    n = len(arr)

    # Outer loop for passes
    for i in range(n - 1):
        # Inner loop for comparisons
        for j in range(n - i - 1):
            # Swap if current element is greater than next
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

    return arr


# Usage example
unsorted_array = [64, 34, 25, 12, 22, 11, 90]
print("Unsorted array:", unsorted_array)
sorted_array = bubble_sort(unsorted_array[:])
print("Sorted array:", sorted_array)`,
        },
        {
            id: "java",
            label: "Java",
            language: "JAVA",
            syncsWithTrace: false,
            code: `// Bubble Sort in Java
import java.util.Arrays;

public class BubbleSortExample {
    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;

        // Outer loop for passes
        for (int i = 0; i < n - 1; i++) {
            // Inner loop for comparisons
            for (int j = 0; j < n - i - 1; j++) {
                // Swap if current element is greater than next
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }

        return arr;
    }

    public static void main(String[] args) {
        int[] unsortedArray = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Unsorted array: " + Arrays.toString(unsortedArray));
        int[] sortedArray = bubbleSort(unsortedArray.clone());
        System.out.println("Sorted array: " + Arrays.toString(sortedArray));
    }
}`,
        },
        {
            id: "cpp",
            label: "C++",
            language: "C++",
            syncsWithTrace: false,
            code: `// Bubble Sort in C++
#include <iostream>
#include <vector>

using namespace std;

vector<int> bubbleSort(vector<int> arr) {
    int n = static_cast<int>(arr.size());

    // Outer loop for passes
    for (int i = 0; i < n - 1; i++) {
        // Inner loop for comparisons
        for (int j = 0; j < n - i - 1; j++) {
            // Swap if current element is greater than next
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }

    return arr;
}

int main() {
    vector<int> unsortedArray = {64, 34, 25, 12, 22, 11, 90};
    cout << "Unsorted array: ";
    for (int value : unsortedArray) cout << value << " ";
    cout << endl;

    vector<int> sortedArray = bubbleSort(unsortedArray);
    cout << "Sorted array: ";
    for (int value : sortedArray) cout << value << " ";
    cout << endl;
}`,
        },
    ],
        "insertion sort": [
                {
                        id: "pseudocode",
                        label: "Pseudocode",
                        language: "PSEUDOCODE",
                        syncsWithTrace: true,
                        traceLineMap: {
                                1: 1,
                                2: [2, 3],
                                3: 4,
                                4: 5,
                                5: 6,
                                6: 7,
                                7: 8,
                        },
                        code: `function insertionSort(arr)
    for i ← 1 to length(arr) - 1
        key ← arr[i], j ← i - 1
        while j ≥ 0 and arr[j] > key
            arr[j + 1] ← arr[j]
            j ← j - 1
        arr[j + 1] ← key
    return arr`,
                },
        ],
    "binary search": [
        {
            id: "pseudocode",
            label: "Pseudocode",
            language: "PSEUDOCODE",
            syncsWithTrace: true,
            // TODO: confirm exact lineNumber values from backend and update map
            traceLineMap: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
            },
            code: `function binarySearch(arr, target)
  low ← 0
  high ← length(arr) - 1
  while low ≤ high
    mid ← floor((low + high) / 2)
    if arr[mid] == target: return mid
    else if arr[mid] < target: low ← mid + 1
    else: high ← mid - 1
  return -1`,
        },
        {
            id: "javascript",
            label: "JavaScript",
            language: "JAVASCRIPT",
            syncsWithTrace: false,
            code: `// Binary Search in JavaScript
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    // Find the middle index
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) {
      return mid; // Target found
    } else if (arr[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }

  return -1; // Target not found
}

// Usage example (array must be sorted)
const sortedArray = [3, 7, 12, 19, 25, 31, 44, 58];
console.log("Array:", sortedArray);
console.log("Search for 25:", binarySearch(sortedArray, 25)); // 4
console.log("Search for 10:", binarySearch(sortedArray, 10)); // -1`,
        },
        {
            id: "python",
            label: "Python",
            language: "PYTHON",
            syncsWithTrace: false,
            code: `# Binary Search in Python
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        # Find the middle index
        mid = (low + high) // 2

        if arr[mid] == target:
            return mid  # Target found
        elif arr[mid] < target:
            low = mid + 1  # Discard left half
        else:
            high = mid - 1  # Discard right half

    return -1  # Target not found


# Usage example (array must be sorted)
sorted_array = [3, 7, 12, 19, 25, 31, 44, 58]
print("Array:", sorted_array)
print("Search for 25:", binary_search(sorted_array, 25))  # 4
print("Search for 10:", binary_search(sorted_array, 10))  # -1`,
        },
        {
            id: "java",
            label: "Java",
            language: "JAVA",
            syncsWithTrace: false,
            code: `// Binary Search in Java
import java.util.Arrays;

public class BinarySearchExample {
    public static int binarySearch(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;

        while (low <= high) {
            // Find the middle index
            int mid = (low + high) / 2;

            if (arr[mid] == target) {
                return mid; // Target found
            } else if (arr[mid] < target) {
                low = mid + 1; // Discard left half
            } else {
                high = mid - 1; // Discard right half
            }
        }

        return -1; // Target not found
    }

    public static void main(String[] args) {
        int[] sortedArray = {3, 7, 12, 19, 25, 31, 44, 58};
        System.out.println("Array: " + Arrays.toString(sortedArray));
        System.out.println("Search for 25: " + binarySearch(sortedArray, 25)); // 4
        System.out.println("Search for 10: " + binarySearch(sortedArray, 10)); // -1
    }
}`,
        },
        {
            id: "cpp",
            label: "C++",
            language: "C++",
            syncsWithTrace: false,
            code: `// Binary Search in C++
#include <iostream>
#include <vector>

using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int low = 0;
    int high = static_cast<int>(arr.size()) - 1;

    while (low <= high) {
        // Find the middle index
        int mid = (low + high) / 2;

        if (arr[mid] == target) {
            return mid; // Target found
        } else if (arr[mid] < target) {
            low = mid + 1; // Discard left half
        } else {
            high = mid - 1; // Discard right half
        }
    }

    return -1; // Target not found
}

int main() {
    vector<int> sortedArray = {3, 7, 12, 19, 25, 31, 44, 58};
    cout << "Search for 25: " << binarySearch(sortedArray, 25) << endl; // 4
    cout << "Search for 10: " << binarySearch(sortedArray, 10) << endl; // -1
}`,
        },
    ],
    "heap sort": [
        {
            id: "pseudocode",
            label: "Pseudocode",
            language: "PSEUDOCODE",
            syncsWithTrace: true,
            traceLineMap: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
                10: 10,
                11: 11,
            },
            code: `function heapSort(arr)
  buildMaxHeap(arr)
  for i ← length(arr)-1 down to 1
    swap arr[0], arr[i]
    heapBoundary ← i - 1
    siftDown(arr, root=0, heapBoundary)
  end for
  extractionPhaseComplete()
  return arr

function siftDown(arr, root, heapBoundary)
  compare/swap root with larger child until heap property restored`,
        },
        {
            id: "javascript",
            label: "JavaScript",
            language: "JAVASCRIPT",
            syncsWithTrace: false,
            code: `// Heap Sort in JavaScript
function heapSort(arr) {
  const values = [...arr];
  const n = values.length;

  function siftDown(heapSize, root) {
    let current = root;

    while (true) {
      const left = 2 * current + 1;
      const right = left + 1;
      let largest = current;

      if (left < heapSize && values[left] > values[largest]) {
        largest = left;
      }

      if (right < heapSize && values[right] > values[largest]) {
        largest = right;
      }

      if (largest === current) {
        break;
      }

      [values[current], values[largest]] = [values[largest], values[current]];
      current = largest;
    }
  }

  for (let parent = Math.floor(n / 2) - 1; parent >= 0; parent -= 1) {
    siftDown(n, parent);
  }

  for (let end = n - 1; end > 0; end -= 1) {
    [values[0], values[end]] = [values[end], values[0]];
    siftDown(end, 0);
  }

  return values;
}

const unsorted = [8, 3, 5, 1, 9, 2];
console.log("Unsorted:", unsorted);
console.log("Sorted:", heapSort(unsorted));`,
        },
        {
            id: "python",
            label: "Python",
            language: "PYTHON",
            syncsWithTrace: false,
            code: `# Heap Sort in Python
def heap_sort(arr):
    values = arr[:]
    n = len(values)

    def sift_down(heap_size, root):
        current = root

        while True:
            left = 2 * current + 1
            right = left + 1
            largest = current

            if left < heap_size and values[left] > values[largest]:
                largest = left

            if right < heap_size and values[right] > values[largest]:
                largest = right

            if largest == current:
                break

            values[current], values[largest] = values[largest], values[current]
            current = largest

    for parent in range((n // 2) - 1, -1, -1):
        sift_down(n, parent)

    for end in range(n - 1, 0, -1):
        values[0], values[end] = values[end], values[0]
        sift_down(end, 0)

    return values


unsorted = [8, 3, 5, 1, 9, 2]
print("Unsorted:", unsorted)
print("Sorted:", heap_sort(unsorted))`,
        },
        {
            id: "java",
            label: "Java",
            language: "JAVA",
            syncsWithTrace: false,
            code: `// Heap Sort in Java
import java.util.Arrays;

public class HeapSortExample {
    public static int[] heapSort(int[] input) {
        int[] values = input.clone();
        int n = values.length;

        for (int parent = (n / 2) - 1; parent >= 0; parent--) {
            siftDown(values, n, parent);
        }

        for (int end = n - 1; end > 0; end--) {
            int temp = values[0];
            values[0] = values[end];
            values[end] = temp;
            siftDown(values, end, 0);
        }

        return values;
    }

    private static void siftDown(int[] values, int heapSize, int root) {
        int current = root;

        while (true) {
            int left = 2 * current + 1;
            int right = left + 1;
            int largest = current;

            if (left < heapSize && values[left] > values[largest]) {
                largest = left;
            }

            if (right < heapSize && values[right] > values[largest]) {
                largest = right;
            }

            if (largest == current) {
                break;
            }

            int temp = values[current];
            values[current] = values[largest];
            values[largest] = temp;
            current = largest;
        }
    }

    public static void main(String[] args) {
        int[] unsorted = {8, 3, 5, 1, 9, 2};
        System.out.println("Unsorted: " + Arrays.toString(unsorted));
        System.out.println("Sorted: " + Arrays.toString(heapSort(unsorted)));
    }
}`,
        },
        {
            id: "cpp",
            label: "C++",
            language: "C++",
            syncsWithTrace: false,
            code: `// Heap Sort in C++
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void siftDown(vector<int>& values, int heapSize, int root) {
    int current = root;

    while (true) {
        int left = 2 * current + 1;
        int right = left + 1;
        int largest = current;

        if (left < heapSize && values[left] > values[largest]) {
            largest = left;
        }

        if (right < heapSize && values[right] > values[largest]) {
            largest = right;
        }

        if (largest == current) {
            break;
        }

        swap(values[current], values[largest]);
        current = largest;
    }
}

vector<int> heapSort(vector<int> input) {
    vector<int> values = input;
    int n = static_cast<int>(values.size());

    for (int parent = (n / 2) - 1; parent >= 0; --parent) {
        siftDown(values, n, parent);
    }

    for (int end = n - 1; end > 0; --end) {
        swap(values[0], values[end]);
        siftDown(values, end, 0);
    }

    return values;
}

int main() {
    vector<int> unsorted = {8, 3, 5, 1, 9, 2};
    vector<int> sorted = heapSort(unsorted);

    cout << "Unsorted: ";
    for (int v : unsorted) cout << v << " ";
    cout << endl;

    cout << "Sorted: ";
    for (int v : sorted) cout << v << " ";
    cout << endl;

    return 0;
}`,
        },
    ],
    "merge sort": [
        {
            id: "pseudocode",
            label: "Pseudocode",
            language: "PSEUDOCODE",
            syncsWithTrace: true,
            traceLineMap: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
                10: 10,
                11: 11,
                12: 12,
            },
            code: `function mergeSort(arr, left, right)
  mergeSort(arr, left, right)           // recursive call
  if left >= right: return              // base case
  mid ← left + (right - left) / 2      // split
  mergeSort(arr, left, mid)             // sort left half
  mergeSort(arr, mid+1, right)          // sort right half
  merge(arr, left, mid, right)          // begin merge
  begin merging left and right halves   // merge_start
  compare arr[i] vs arr[j]             // compare
  place smaller into arr[k]            // place
  merged region is fully sorted        // merge_complete
  return sorted sub-array              // return`,
        },
        {
            id: "javascript",
            label: "JavaScript",
            language: "JAVASCRIPT",
            syncsWithTrace: false,
            code: `// Merge Sort in JavaScript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                      result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

const arr = [8, 3, 5, 1, 9, 2];
console.log("Sorted:", mergeSort(arr));`,
        },
        {
            id: "python",
            label: "Python",
            language: "PYTHON",
            syncsWithTrace: false,
            code: `# Merge Sort in Python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]

arr = [8, 3, 5, 1, 9, 2]
print("Sorted:", merge_sort(arr))`,
        },
        {
            id: "java",
            label: "Java",
            language: "JAVA",
            syncsWithTrace: false,
            code: `// Merge Sort in Java
import java.util.Arrays;

public class MergeSortExample {
    public static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }

    static void merge(int[] arr, int l, int m, int r) {
        int[] tmp = Arrays.copyOfRange(arr, l, r + 1);
        int i = 0, j = m - l + 1, k = l, end = r - l;
        while (i <= m - l && j <= end)
            arr[k++] = tmp[i] <= tmp[j] ? tmp[i++] : tmp[j++];
        while (i <= m - l) arr[k++] = tmp[i++];
        while (j <= end)   arr[k++] = tmp[j++];
    }

    public static void main(String[] args) {
        int[] arr = {8, 3, 5, 1, 9, 2};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println(Arrays.toString(arr));
    }
}`,
        },
        {
            id: "cpp",
            label: "C++",
            language: "C++",
            syncsWithTrace: false,
            code: `// Merge Sort in C++
#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& a, int l, int m, int r) {
    vector<int> L(a.begin()+l, a.begin()+m+1);
    vector<int> R(a.begin()+m+1, a.begin()+r+1);
    int i=0, j=0, k=l;
    while (i<(int)L.size() && j<(int)R.size())
        a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
    while (i<(int)L.size()) a[k++] = L[i++];
    while (j<(int)R.size()) a[k++] = R[j++];
}

void mergeSort(vector<int>& a, int l, int r) {
    if (l >= r) return;
    int m = l + (r-l)/2;
    mergeSort(a, l, m);
    mergeSort(a, m+1, r);
    merge(a, l, m, r);
}

int main() {
    vector<int> a = {8,3,5,1,9,2};
    mergeSort(a, 0, a.size()-1);
    for (int v : a) cout << v << " ";
}`,
        },
    ],
};

const sampleSizes = [8, 16, 32, 64, 128, 256];

const algorithmIconByName = {
    "bubble sort": Bubbles,
    "binary search": Search,
    "insertion sort": Rewind,
    "selection sort": Activity,
    "merge sort": GitMerge,
    "quick sort": Zap,
    "heap sort": Cpu,
};

export function getAlgorithmDifficulty(name) {
    return difficultyByAlgorithm[name.trim().toLowerCase()] || "Core";
}

export function getAlgorithmIcon(name) {
    return algorithmIconByName[name.trim().toLowerCase()] || Activity;
}

export function getPrimaryComplexity(algorithm) {
    return algorithm.timeComplexityAverage
        || algorithm.timeComplexityWorst
        || algorithm.timeComplexityBest
        || "Not available";
}

export function getAlgorithmSampleInput(name) {
    switch (name.trim().toLowerCase()) {
        case "bubble sort":
        case "insertion sort":
        case "selection sort":
        case "merge sort":
        case "quick sort":
        case "heap sort":
            return [8, 3, 5, 1, 9, 2];
        case "binary search":
            // Binary Search requires a pre-sorted array
            return [3, 7, 12, 19, 25, 31, 44, 58];
        default:
            return [8, 3, 5, 1, 9, 2];
    }
}

export function getSimulationAlgorithmKey(name) {
    return algorithmKeyByName[name.trim().toLowerCase()] || name.trim().toLowerCase().replace(/\s+/g, "_");
}

export function getSpaceComplexity(name) {
    return spaceComplexityByAlgorithm[name.trim().toLowerCase()] || "O(n)";
}

function normalizeComplexityLabel(label) {
    return label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("²", "^2");
}

function evaluateComplexity(label, n) {
    const normalized = normalizeComplexityLabel(label);

    switch (normalized) {
        case "o(1)":
            return 1;
        case "o(logn)":
            return Math.log2(n);
        case "o(n)":
            return n;
        case "o(nlogn)":
            return n * Math.log2(n);
        case "o(n^2)":
            return n * n;
        default:
            return n;
    }
}

function scaleSeriesValues(values) {
    const maxValue = Math.max(...values, 1);

    return values.map((value) => Math.max(1, Math.round((value / maxValue) * 100)));
}

export function getComplexityChartData(algorithm) {
    const timeLabels = {
        best: algorithm.timeComplexityBest || "O(n)",
        average: algorithm.timeComplexityAverage || algorithm.timeComplexityWorst || "O(n)",
        worst: algorithm.timeComplexityWorst || algorithm.timeComplexityAverage || "O(n)",
    };
    const spaceLabel = getSpaceComplexity(algorithm.name);

    const bestValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(timeLabels.best, n)));
    const averageValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(timeLabels.average, n)));
    const worstValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(timeLabels.worst, n)));
    const spaceValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(spaceLabel, n)));

    return {
        timeLabels,
        spaceLabel,
        timeData: sampleSizes.map((n, index) => ({
            n,
            best: bestValues[index],
            average: averageValues[index],
            worst: worstValues[index],
        })),
        spaceData: sampleSizes.map((n, index) => ({
            n,
            space: spaceValues[index],
        })),
    };
}

export function getAlgorithmQuizMetadata(name) {
    return quizMetadataByAlgorithm[name.trim().toLowerCase()] || {
        available: false,
        questionCount: 5,
        xpReward: 50,
        timeMinutes: 3,
    };
}

export function getAlgorithmPseudocode(name) {
    return pseudocodeByAlgorithm[name.trim().toLowerCase()] || [
        "initialize the algorithm state",
        "evaluate the current input region",
        "apply the next comparison or decision",
        "update the data structure state",
        "repeat until the algorithm reaches its stopping condition",
    ];
}

export function getAlgorithmCodeSnippets(name) {
    const normalizedName = name.trim().toLowerCase();

    return codeSnippetsByAlgorithm[normalizedName] || [
        {
            id: "pseudocode",
            label: "Pseudocode",
            language: "PSEUDOCODE",
            syncsWithTrace: true,
            traceLineMap: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
            },
            code: getAlgorithmPseudocode(name)
                .join("\n"),
        },
    ];
}

export function getAlgorithmIntroduction(name) {
    const normalizedName = name.trim().toLowerCase();

    if (normalizedName === "bubble sort") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Bubble Sort work?",
            paragraphs: [
                "Bubble Sort scans the array from left to right, comparing adjacent values and swapping them whenever the left value is larger than the right one.",
                "After each full pass, the largest unsorted value settles into its final position. The process repeats until a pass completes with no swaps.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Start with unsorted array",
                    desc: "Begin with an unsorted list of numbers and prepare for the first pass.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Compare adjacent pairs",
                    desc: "Move across the array and compare each neighboring pair in order.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Swap if out of order",
                    desc: "When the left value is larger, swap the pair so the bigger value moves right.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Repeat each pass",
                    desc: "Finish the pass, lock the largest value in place, and continue with the remaining unsorted portion.",
                    matchAction: "sorted",
                },
                {
                    num: "05",
                    title: "Early exit check",
                    desc: "If a pass completes without swaps, the array is already sorted and the algorithm stops.",
                    matchAction: "complete",
                },
            ],
        };
    }

    if (normalizedName === "binary search") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Binary Search work?",
            paragraphs: [
                "Binary Search works on sorted arrays by repeatedly halving the search space. Rather than checking every element, it eliminates half of the remaining candidates with each comparison.",
                "Each step identifies the midpoint of the current window, compares it to the target, then discards the half that cannot contain the answer — making it O(log n) in time.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Initialize pointers",
                    desc: "Set low = 0 and high = last index to define the full search window.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Find the midpoint",
                    desc: "Compute mid = floor((low + high) / 2) and compare arr[mid] to the target.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Discard half",
                    desc: "Move low or high past mid to eliminate the half that cannot contain the target.",
                    matchAction: "discard",
                },
                {
                    num: "04",
                    title: "Found or absent",
                    desc: "Return the index if found, or -1 when the search window becomes empty.",
                    matchAction: "found",
                },
            ],
        };
    }

    if (normalizedName === "quick sort") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Quick Sort work?",
            paragraphs: [
                "Quick Sort is a divide-and-conquer sorting algorithm that selects a pivot, partitions the remaining values around that pivot, and then recursively sorts the two resulting partitions.",
                "Its average-case performance is O(n log n), but the pivot choice matters: consistently poor pivots can degrade the runtime to O(n^2).",
            ],
            steps: [
                {
                    num: "01",
                    title: "Choose a pivot",
                    desc: "Pick a pivot value that will be used to split smaller values from larger ones.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Partition around the pivot",
                    desc: "Rearrange the range so values less than the pivot move left and larger values move right.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Place the pivot",
                    desc: "Move the pivot into its final sorted position after partitioning finishes.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Recurse on both sides",
                    desc: "Apply the same process to the left and right partitions until each partition has size zero or one.",
                    matchAction: "complete",
                },
            ],
        };
    }

    if (normalizedName === "merge sort") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Merge Sort work?",
            paragraphs: [
                "Merge Sort repeatedly splits the array into halves until each subarray has one element, then merges those subarrays back together in sorted order.",
                "Because each merge step combines already-sorted halves, Merge Sort guarantees O(n log n) time but needs extra memory to hold intermediate merged results.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Split the array",
                    desc: "Divide the input into left and right halves until single-element arrays remain.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Sort each half",
                    desc: "Recursively process the left half and the right half independently.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Merge in order",
                    desc: "Compare the front values of both halves and build one sorted output list.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Repeat upward",
                    desc: "Continue merging larger sorted halves until the full array is reconstructed.",
                    matchAction: "complete",
                },
            ],
        };
    }

    if (normalizedName === "insertion sort") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Insertion Sort work?",
            paragraphs: [
                "Insertion Sort grows a sorted prefix one item at a time. Each new value is compared against the sorted portion and inserted into the correct position.",
                "It performs especially well on nearly sorted data because only a few shifts are needed when elements are already close to their final positions.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Start with a sorted prefix",
                    desc: "Treat the first element as already sorted and begin scanning from the second element.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Pick the key",
                    desc: "Take the next unsorted value and hold it temporarily as the key to insert.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Shift larger values",
                    desc: "Move larger values in the sorted prefix one position to the right until the correct slot opens.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Insert and continue",
                    desc: "Place the key into its correct position and repeat for the next unsorted value.",
                    matchAction: "complete",
                },
            ],
        };
    }

    if (normalizedName === "selection sort") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Selection Sort work?",
            paragraphs: [
                "Selection Sort repeatedly finds the minimum value in the unsorted region and swaps it into the next position of the sorted prefix.",
                "It always performs the same number of comparisons for a given input size, making it easy to reason about but less adaptive than Insertion Sort.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Mark the boundary",
                    desc: "Treat everything before the current index as sorted and everything after it as unsorted.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Scan for the minimum",
                    desc: "Search the unsorted region to find the index of its smallest value.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Swap into position",
                    desc: "Exchange that minimum value with the first unsorted element.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Advance the boundary",
                    desc: "Grow the sorted prefix by one and repeat until no unsorted values remain.",
                    matchAction: "complete",
                },
            ],
        };
    }

    if (normalizedName === "heap sort") {
        return {
            eyebrow: "01 - Introduction",
            title: "How does Heap Sort work?",
            paragraphs: [
                "Heap Sort first arranges the array into a max heap so the largest value is always at the root, then repeatedly moves that root to the end of the array.",
                "After each extraction, the heap is rebuilt at the root so the next largest value can be placed. This keeps the algorithm in-place with O(n log n) time.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Build a max heap",
                    desc: "Reorganize the array so every parent is greater than or equal to its children.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Move the root",
                    desc: "Swap the largest value at the root with the last unsorted element.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Restore heap order",
                    desc: "Heapify the root so the remaining unsorted region is again a valid max heap.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Repeat extraction",
                    desc: "Shrink the heap boundary and keep extracting until the array is fully sorted.",
                    matchAction: "complete",
                },
            ],
        };
    }

    return {
        eyebrow: "01 - Introduction",
        title: `How does ${name} work?`,
        paragraphs: [
            `${name} follows a structured sequence of comparisons and state changes that can be broken down into a few core phases.`,
            "Use the cards below to review the major phases and connect them to the complexity and code sections on the page.",
        ],
        steps: [
            {
                num: "01",
                title: "Prepare input",
                desc: "Start with the input values and initialize the algorithm state.",
                matchAction: "start",
            },
            {
                num: "02",
                title: "Process state",
                desc: "Advance through the main comparisons or recursive decisions.",
                matchAction: "compare",
            },
            {
                num: "03",
                title: "Apply updates",
                desc: "Commit the state change that moves the algorithm forward.",
                matchAction: "swap",
            },
            {
                num: "04",
                title: "Complete result",
                desc: "Finish once the backend reports the trace is complete.",
                matchAction: "complete",
            },
        ],
    };
}
