function buildProfileText(profile = {}) {
  return [
    `Education: ${profile.education || 'Not specified'}${profile.stream ? `, ${profile.stream}` : ''}`,
    `Location: ${profile.location || 'India'}`,
    `Activities: ${(profile.activities || []).join(', ') || 'Not specified'}`,
    `Work preferences: ${(profile.preferences || []).join(', ') || 'Not specified'}`,
    `Quiz level: ${profile.quizLevel || 'basic'} with score ${profile.quizScore || 0}/10`,
    `Financial condition: ${profile.financialCondition || 'Not specified'}`,
    `Job timeline: ${profile.needJobIn || 'Flexible'}`,
    `Career awareness: ${(profile.careerAwareness || []).join(', ') || 'Limited'}`,
    `Goal: ${profile.goal || 'Not specified'}`,
  ].join('\n')
}

function careerKnowledgeText(career) {
  return [
    `Career: ${career.career}`,
    `Domain: ${career.domain}`,
    `Description: ${career.description}`,
    `Required skills: ${career.requiredSkills.join(', ')}`,
    `Interests: ${career.interests.join(', ')}`,
    `Education: ${career.education}`,
  ].join('\n')
}

module.exports = { buildProfileText, careerKnowledgeText }
