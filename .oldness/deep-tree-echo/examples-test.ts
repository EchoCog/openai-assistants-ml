import { A000081Examples } from './enumeration-examples';

// Example usage
console.log("A000081 Sequence Examples\n");

// Show first 4 orders
for (let order = 1; order <= 4; order++) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(A000081Examples.explainCorrespondence(order));
  console.log("\nVisual Representation:");
  console.log(A000081Examples.visualizeExample(order));
}

// Example output for order 3:
/*
Order 3 (Count: 2)

1. Rooted Trees:
   1. Order: 3, Symmetry: 1
      Elementary Differential: f'''
      RK Condition: τ₃₁
   2. Order: 3, Symmetry: 2
      Elementary Differential: f''∘f'
      RK Condition: τ₃₂

Tree 1:                Membrane 1:
  o                    ⟨ ⟨ ⟨ ⟩ ⟩ ⟩
  |                    
  o                    MultiSet:
  |                    {a{b{c}}}
  o                    

Tree 2:                Membrane 2:
  o                    ⟨ ⟨ ⟩ ⟨ ⟩ ⟩
  |                    
 o-o                   MultiSet:
                       {a{b},{c}}

Differential Forms:
1. d³y/dx³
2. (d²y/dx²)(dy/dx)

Projective Geometry:
1. point in P³
2. plane in P³

Symmetry Groups:
1. C₃
2. D₂
*/ 