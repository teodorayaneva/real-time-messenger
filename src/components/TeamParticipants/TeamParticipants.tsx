import { useEffect, useState } from 'react';
import { uid } from 'uid';
import { TeamParticipantsProps } from '../../types/Interfaces';

const TeamParticipants = ({ team, setIsDetailedChatClicked }: TeamParticipantsProps): JSX.Element => {
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    if (team) {
      setMembers(team.members);
    }
  }, [team]);
  const mappingParticipants = (participant: string, key: string) => {
    return <div key={key}>
      <p className='participant-item'>{participant}</p>
    </div>;
  };

  return (
    <div className="participants-list">

      <h4>Owner:</h4>
      <h5>{team?.owner}</h5>

      <h4>Participants of team:</h4>
      <div className='participants'>
        {members.map((participant) => mappingParticipants(participant, uid()))}
      </div>

      <div className="manage-participants-btns">
        <button className="add-btn" onClick={() => {
          setIsDetailedChatClicked(true);
        }}><span>Chat details</span></button>

      </div>
    </div>
  );
};

export default TeamParticipants;
