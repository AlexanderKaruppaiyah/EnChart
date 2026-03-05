import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

const FALLBACK_QUESTIONS = [
    { id: 1, title: 'ATM Withdrawal Logic', description: 'Design a flowchart for an ATM withdrawal process. Include card insertion, PIN validation (max 3 attempts), balance verification, amount selection, cash dispensing, and receipt printing.', explanation: 'Use diamond shapes for PIN validation and balance checks. Include loops for retry logic and terminal states for both success and failure paths.' },
    { id: 2, title: 'Student Grading System', description: 'Create a flowchart that takes marks for 3 subjects, computes the average, and assigns grades: A (≥80), B (≥60), C (≥40), or F (<40).', explanation: 'Start with input blocks for each subject, use a process block for average computation, and cascading decision diamonds for grade determination.' },
    { id: 3, title: 'Inventory Reorder Process', description: 'Model an automated inventory management flow. Check current stock levels against a minimum threshold, trigger purchase orders when low, and schedule the next check cycle.', explanation: 'Use a decision block for stock comparison. Show the reorder subprocess and the loop-back mechanism to the initial monitoring state.' },
    { id: 4, title: 'Factorial Calculation', description: 'Design the algorithm to compute the factorial of a number N using an iterative loop approach.', explanation: 'Initialize result=1 and counter=N. Use a decision block for the loop condition (counter > 0), update result *= counter and counter -= 1 each iteration.' },
    { id: 5, title: 'Binary Search Algorithm', description: 'Create a flowchart for searching a target value in a sorted array using the binary search technique.', explanation: 'Show initialization of low/high pointers, computation of mid, and three-way decision: target < mid (go left), target > mid (go right), or target == mid (found).' },
    { id: 6, title: 'Traffic Light Controller', description: 'Model a traffic signal state machine that cycles through Green (30s) → Yellow (5s) → Red (20s) → Green, with emergency override capability.', explanation: 'Show the circular state flow with timed transitions. Add an interrupt path for emergency vehicle detection that forces all lights to red.' },
    { id: 7, title: 'Email Registration Validator', description: 'Validate a user registration form: check email format, verify domain is not blocklisted, ensure password meets complexity requirements (length, special chars, numbers).', explanation: 'Use sequential decision blocks for each validation step. Include error feedback paths that loop back to the input stage.' },
    { id: 8, title: 'Fibonacci Sequence Generator', description: 'Design an algorithm to generate and display the first 10 numbers in the Fibonacci sequence.', explanation: 'Initialize a=0, b=1, counter=0. Loop while counter < 10: output a, compute temp=a+b, shift values, increment counter.' },
    { id: 9, title: 'Vending Machine Transaction', description: 'Model the complete vending machine flow: item selection, credit insertion, price comparison, item dispensing, and change calculation.', explanation: 'Use decision diamonds for credit sufficiency checks. Include loops for additional credit insertion and process blocks for change computation.' },
    { id: 10, title: 'Order Fulfillment Pipeline', description: 'Design the e-commerce order lifecycle: receive order → verify payment → check stock → pack items → assign carrier → ship → update tracking → notify customer.', explanation: 'Include decision branches for payment failure, out-of-stock items (trigger backorder or cancellation), and shipping exceptions.' },
];

export async function GET() {
    try {
        const supabase = getSupabaseServer();
        const { data, error } = await supabase
            .from('questions')
            .select('id, title, description, explanation')
            .order('id', { ascending: true });

        if (error) {
            console.error('DB error fetching questions:', error.message);
            // Return fallback if table doesn't exist or RLS blocks
            return NextResponse.json({ questions: FALLBACK_QUESTIONS, source: 'fallback' });
        }

        if (data && data.length > 0) {
            return NextResponse.json({ questions: data, source: 'database' });
        }

        // Table exists but is empty
        return NextResponse.json({ questions: FALLBACK_QUESTIONS, source: 'fallback' });
    } catch (err) {
        console.error('Questions API error:', err);
        return NextResponse.json({ questions: FALLBACK_QUESTIONS, source: 'fallback' });
    }
}
