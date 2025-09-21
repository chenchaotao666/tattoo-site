import React from 'react';

interface Step {
  step: string;
  title: string;
  description: string;
}

interface HowToCreateProps {
  title: string;
  steps: Step[];
}

const HowToCreate: React.FC<HowToCreateProps> = ({ title, steps }) => {
  return (
    <div style={{ width: '1170px', minHeight: '367px', position: 'relative', borderRadius: '16px' }}>
      <h2 style={{
        left: '289px',
        top: '0px',
        position: 'absolute',
        textAlign: 'center',
        color: 'var(--_taliwind-White-200, #ECECEC)',
        fontSize: '56px',
        fontFamily: 'Inter',
        fontWeight: '700',
        textTransform: 'capitalize',
        wordWrap: 'break-word'
      }}>
        {title}
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '21px',
        marginTop: '148px',
        height: 'auto'
      }}>
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              width: '376px',
              padding: '36px',
              background: 'var(--zinc-500, #19191F)',
              borderRadius: '16px',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: '10px',
              display: 'flex',
              flex: '1'
            }}
          >
          <div style={{
            width: '304px',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '24px',
            display: 'flex'
          }}>
            <div style={{
              width: '304px',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: '8px',
              display: 'flex'
            }}>
              <div style={{
                alignSelf: 'stretch',
                color: 'var(--white-400, #A5A5A5)',
                fontSize: '16px',
                fontFamily: 'Inter',
                fontWeight: '400',
                wordWrap: 'break-word'
              }}>
                {step.step}
              </div>
              <h3 style={{
                alignSelf: 'stretch',
                color: 'var(--white-200, #ECECEC)',
                fontSize: '20px',
                fontFamily: 'Inter',
                fontWeight: '500',
                textTransform: 'capitalize',
                wordWrap: 'break-word',
                whiteSpace: 'normal'
              }}>
                {step.title}
              </h3>
            </div>
            <div style={{
              alignSelf: 'stretch',
              color: 'var(--white-400, #A5A5A5)',
              fontSize: '16px',
              fontFamily: 'Inter',
              fontWeight: '400',
              lineHeight: '24px',
              wordWrap: 'break-word'
            }}>
              {step.description}
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
};

export default HowToCreate;