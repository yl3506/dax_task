function consentProcedure() {
    const consent = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
        <div class="content-container">

            <h1>Consent Form</h1>
            <p>Welcome!</p>
            <p>Please consider this information carefully before deciding whether to participate in this study.</p>

            <p></p>
            <h3>Purpose of the study:</h3>
            <p>This study will help us understand how humans learn and apply new concepts.</p>

            <p></p>
            <h3>What you will do in this study:</h3>
            <p>Read and understand the instructions for the study.</p>
            <p>Learn new concepts of operations through examples and practices.</p>
            <p>Apply the operations to new examples during testing.</p>
            <p>Answer a few demographic questions at the end.</p>

            <p></p>
            <h3>Duration of study:</h3>
            <p>Participation will take approximately 30 minutes to complete.</p>

            <p></p>
            <h3>Compensation:</h3>
            <p>Base payment: You will receive $8 base payment (around $16/hour) by completing this study.</p>
            <p>Bonus payment: For every example you answer correctly in <b style="color: red">testing phase</b>, you will receive $0.25 extra payment.</p>

            <p></p>
            <h3>Risks:</h3>
            <p>If you choose to participate, 
            the effects should be comparable to those you would experience from viewing a computer monitor for 30 minutes and using a mouse or keyboard.</p>

            <p></p>
            <h3>Confidentiality:</h3>
            <p>Your participation in this study will remain confidential.</p>
            <p>No personally identifiable information will be associated with your data.</p>

            <p></p>
            <h3>Participation and withdrawal:</h3>
            <p>Your participation in this study is completely voluntary 
            and you may refuse to participate without penalty or loss of benefits to which you may otherwise be entitled.</p>
            <p>Also, you may choose to withdraw at any time without penalty.</p>

            <p></p>
            <h3>How to contact the researchers:</h3>
            <p>If you have questions or concerns about your participation or payment, or want to request a summary of research findings, please contact the researcher: Yichen Li, yichenli@fas.harvard.edu</p>

            <p></p>
            <h3>Whom to contact about your rights as a participant in this research:</h3>
            <p>
            For questions, concerns, suggestions, 
            or complaints that have not been or cannot be addressed by the researcher, 
            or to report research-related harm, 
            please contact the Committee on the Use of Human Subjects in Research at Harvard University 
            by phone at 617-496-2847 or by email at cuhs@harvard.edu
            </p>

            <p></p>
            <h3>CONSENT STATEMENT:</h3>
            <p>If you agree to participate, please click the "Consent" button below.
            Thank you very much for your time and consideration.
            <b>
            <p>By selecting the “Consent” button, I acknowledge that I have read and understood this consent document, I agree to take part in the research study described above conducted by the lab of Dr. Joshua Greene, and I understand that I am free to withdraw at any time without incurring any penalty.</p>
            <p>If you do NOT agree to participate in this study, please click the "Decline" button.</p>
            </b>

        </div>
        `,
        choices: ['Consent', 'Decline'],
        on_finish: function(data) {
            if (data.response === 1) { // 'Decline' button index 1
                jsPsych.abortExperiment(); 
            }
        }
    };

    return [consent];
}