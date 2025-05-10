/*
    Checking changes the CHECKING state to the passed index_a and index_b
    Swapping index_a and index_b
    Substitution changes the value of index_a with value_a
*/
export interface VisualQueue {
  operation: "CHECKING" | "SWAPPING" | "SUBSTITUTION";
  index_a: number;
  index_b: number;
  value_a: number;
  value_b: number;
}

export type Algorithms = "BUBBLE" | "MERGE" | "QUICK" | "INSERTION";
