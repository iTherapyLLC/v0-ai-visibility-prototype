import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function viewAuditResponses() {
  const auditId = '0e4aa682-1cc9-440e-8feb-fd439bd3776e';
  
  console.log(`\n[v0] Fetching AI responses for audit: ${auditId}\n`);
  
  // Get audit details
  const auditResult = await sql`
    SELECT id, website_url, status, overall_score, citation_count
    FROM audits 
    WHERE id = ${auditId}
  `;
  
  if (auditResult.length === 0) {
    console.log('[v0] No audit found with that ID');
    return;
  }
  
  const audit = auditResult[0];
  console.log('='.repeat(80));
  console.log('AUDIT DETAILS:');
  console.log('='.repeat(80));
  console.log(`Website: ${audit.website_url}`);
  console.log(`Status: ${audit.status}`);
  console.log(`Overall Score: ${audit.overall_score}`);
  console.log(`Citation Count: ${audit.citation_count}`);
  console.log('\n');
  
  // Get all AI responses
  const responses = await sql`
    SELECT id, prompt, response, mentioned, position, sentiment, created_at
    FROM ai_responses 
    WHERE audit_id = ${auditId}
    ORDER BY created_at ASC
  `;
  
  console.log('='.repeat(80));
  console.log(`FOUND ${responses.length} AI RESPONSES:`);
  console.log('='.repeat(80));
  console.log('\n');
  
  responses.forEach((resp, index) => {
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`RESPONSE ${index + 1} of ${responses.length}`);
    console.log(`${'#'.repeat(80)}`);
    console.log(`\nPrompt: "${resp.prompt}"`);
    console.log(`\nMentioned: ${resp.mentioned}`);
    console.log(`Position: ${resp.position ?? 'N/A'}`);
    console.log(`Sentiment: ${resp.sentiment}`);
    console.log(`\n${'-'.repeat(80)}`);
    console.log('FULL AI RESPONSE TEXT:');
    console.log(`${'-'.repeat(80)}`);
    console.log(resp.response);
    console.log(`\n${'='.repeat(80)}\n`);
  });
  
  console.log('\n[v0] Query complete!\n');
}

viewAuditResponses().catch(error => {
  console.error('[v0] Error:', error);
  process.exit(1);
});
