import { useState } from 'react';
import './App.css';

// --- Type Definitions for Instagram Data ---
interface FollowerItem {
  string_list_data: {
    value: string;
    // other properties are ignored
  }[];
}

interface FollowingItem {
  title: string;
  // other properties are ignored
}

interface FollowingData {
  relationships_following: FollowingItem[];
}

function App() {
  const [followers, setFollowers] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const [notFollowingBack, setNotFollowingBack] = useState<string[]>([]);
  const [youDontFollowBack, setYouDontFollowBack] = useState<string[]>([]);

  const [error, setError] = useState<string>('');
  const [hasCompared, setHasCompared] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'followers' | 'following') => {
    const file = event.target.files?.[0];
    if (!file) {
      setError(`Please select a file for ${type}.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        let usernames: Set<string>;

        if (type === 'followers') {
          // Type guard to ensure content is an array of FollowerItem
          if (!Array.isArray(content) || !content[0]?.string_list_data?.[0]?.value) {
            throw new Error("Followers file is not in the expected format.");
          }
          const followersData = content as FollowerItem[];
          usernames = new Set(followersData.map(item => item.string_list_data[0].value));
          setFollowers(usernames);
        } else if (type === 'following') {
          // Type guard to ensure content has the relationships_following property
          if (!content.relationships_following) {
            throw new Error("Following file does not contain 'relationships_following'.");
          }
          const followingData = content as FollowingData;
          usernames = new Set(followingData.relationships_following.map(item => item.title));
          setFollowing(usernames);
        }
        setError(''); // Clear previous errors
      } catch (err) {
        setError(`Error parsing ${file.name}. Please ensure it's the correct, valid JSON file.`);
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleCompare = () => {
    if (followers.size === 0 || following.size === 0) {
      setError('Please upload both followers and following files before comparing.');
      return;
    }

    // Users you follow, but they don't follow you back
    const notFollowingYouBackList = [...following].filter(user => !followers.has(user));
    setNotFollowingBack(notFollowingYouBackList);

    // Users who follow you, but you don't follow them back
    const youDontFollowBackList = [...followers].filter(user => !following.has(user));
    setYouDontFollowBack(youDontFollowBackList);

    setHasCompared(true);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Instagram Follower Analyzer (TS + SWC)</h1>
        <p>Upload your <code>followers_1.json</code> and <code>following.json</code> files to see the results.</p>
      </header>
      <main>
        <div className="upload-section">
          <div className="file-input">
            <label htmlFor="followers-file">Followers File (<code>followers_1.json</code>)</label>
            <input
              id="followers-file"
              type="file"
              accept=".json"
              onChange={(e) => handleFileChange(e, 'followers')}
            />
          </div>
          <div className="file-input">
            <label htmlFor="following-file">Following File (<code>following.json</code>)</label>
            <input
              id="following-file"
              type="file"
              accept=".json"
              onChange={(e) => handleFileChange(e, 'following')}
            />
          </div>
        </div>

        <button onClick={handleCompare} className="compare-button">
          Compare
        </button>

        {error && <p className="error-message">{error}</p>}

        {hasCompared && (
          <div className="results-section">
            <div className="result-list">
              <h2>Don't Follow You Back ({notFollowingBack.length})</h2>
              <div className="user-list">
                {notFollowingBack.map(user => (
                  <div key={user} className="user-item">
                    <span>{user}</span>
                    <a href={`https://instagram.com/${user}`} target="_blank" rel="noopener noreferrer" className="visit-button">
                      Visit
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="result-list">
              <h2>You Don't Follow Back ({youDontFollowBack.length})</h2>
              <div className="user-list">
                {youDontFollowBack.map(user => (
                  <div key={user} className="user-item">
                    <span>{user}</span>
                    <a href={`https://instagram.com/${user}`} target="_blank" rel="noopener noreferrer" className="visit-button">
                      Visit
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
