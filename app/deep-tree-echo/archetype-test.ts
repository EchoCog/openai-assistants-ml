import { ArchetypalEnumeration } from './archetypal-enumeration';

console.log("Archetypal Enumeration Test\n");

// Show progression through levels
for (let n = 1; n <= 5; n++) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(ArchetypalEnumeration.explainArchetype(n));
  console.log("\nVisual Representation:");
  console.log(ArchetypalEnumeration.visualizeLevel(n));
}

/* Example output for n=3 (Analogos):

Level n=3 (s=2, a=2)

Archetype: Analogos
Motif: duality
Characterizes: rationality of all distributed systems
Property: Ratio

P-System Expressions:
1. { [ ] [ ] }
   Bridge: • → [□,□]
2. { [ [ ] ] }
   Bridge: • → [[□]]

Configuration 1:

Membrane:
┌─ │ │ │ │ ─┐

Bridge:
○ ═══> [ ▢ , ▢ ]

Property: ◊/◊

Configuration 2:

Membrane:
┌─ │ │ │ │ ─┐

Bridge:
○ ═══> [ [ ▢ ] ]

Property: ◊²

This level represents:
- Archetypal Pattern: Analogos
- Core Property: Ratio
- System Type: rationality of all distributed systems

The 2 distinct configurations show how duality patterns 
emerge through the interaction of roots (agents) and membranes (arenas).
*/ 