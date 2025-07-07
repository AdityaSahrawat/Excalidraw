import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, LogIn } from 'lucide-react';

const AuthButton = () => {
  const [isAuth, setIsAuth] = useState();
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const toggleTokenInput = () => {
    setShowTokenInput(!showTokenInput);
    setToken('');
  };


  return (
    <div className="flex flex-col items-center gap-4">
      {!showTokenInput ? (
        <Button 
          onClick={toggleTokenInput}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <LogIn size={16} />
          Sign In
        </Button>
      ) : (
        <Card className="w-80">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your JWT token to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="password"
              placeholder="Enter JWT token (hint: 123)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            //   onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex gap-2">
              {/* <Button onClick={handleLogin} className="flex-1">
                Sign In
              </Button> */}
              <Button onClick={toggleTokenInput} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthButton;